'use server'

import { createClient } from '@/utils/supabase/server'
import { sendOrderEmails } from '@/lib/email'

const CARD_PAYMENT_METHODS = ['Visa', 'MasterCard', 'Mada']

type MoyasarPayment = {
  amount?: number
  currency?: string
  status?: string
  metadata?: {
    order_id?: string
  } | null
}

export async function getPaymentOrder(orderId: string) {
  if (!orderId) {
    return { error: 'Invalid order' }
  }

  const supabase = await createClient()
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, total, payment_method, payment_status')
    .eq('id', orderId)
    .single()

  const total = Number(order?.total)

  if (
    error ||
    !order ||
    !CARD_PAYMENT_METHODS.includes(order.payment_method) ||
    order.payment_status !== 'unpaid' ||
    !Number.isFinite(total) ||
    total <= 0
  ) {
    return { error: 'Order is not available for payment' }
  }

  return { success: true, orderId: order.id, total }
}

export async function verifyAndMarkMoyasarPayment(
  paymentId: string,
  orderId: string
) {
  const secretKey = process.env.MOYASAR_SECRET_KEY

  if (!secretKey || !paymentId || !orderId) {
    return { error: 'Unable to verify payment' }
  }

  const paymentResponse = await fetch(
    `https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      },
      cache: 'no-store',
    }
  )

  if (!paymentResponse.ok) {
    return { error: 'Unable to verify payment' }
  }

  const payment = (await paymentResponse.json()) as MoyasarPayment
  const supabase = await createClient()
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, total, payment_method, payment_status')
    .eq('id', orderId)
    .single()

  const expectedAmount = Math.round(Number(order?.total) * 100)
  const paymentOrderId = String(payment.metadata?.order_id || '')

  if (
    orderError ||
    !order ||
    !CARD_PAYMENT_METHODS.includes(order.payment_method) ||
    payment.status !== 'paid' ||
    payment.currency?.toUpperCase() !== 'SAR' ||
    payment.amount !== expectedAmount ||
    paymentOrderId !== order.id
  ) {
    return { error: 'Payment details do not match the order' }
  }

  if (order.payment_status === 'paid') {
    return { success: true }
  }

  if (order.payment_status !== 'unpaid') {
    return { error: 'Order is not awaiting card payment' }
  }

  const { data: updatedOrders, error: updateError } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', status: 'processing' })
    .eq('id', orderId)
    .eq('payment_status', 'unpaid')
    .select('id')

  if (updateError) {
    return { error: 'Unable to update order' }
  }

  if (!updatedOrders?.length) {
    const { data: latestOrder } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .single()

    return latestOrder?.payment_status === 'paid'
      ? { success: true }
      : { error: 'Order payment state changed during verification' }
  }

  const { data: fullOrder } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (name_en, name_ar, product_code)
      )
    `)
    .eq('id', orderId)
    .single()

  if (fullOrder) {
    try {
      await sendOrderEmails(fullOrder)
    } catch (error) {
      console.error('Email error after verified payment:', error)
    }
  }

  return { success: true }
}

export async function getOrderWithItems(orderId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (name_en, name_ar, product_code)
      )
    `)
    .eq('id', orderId)
    .single()

  return data
}
