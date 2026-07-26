import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendOrderEmails } from '@/lib/email'

type MoyasarPayment = {
  id?: string
  status?: string
  amount?: number
  currency?: string
  metadata?: {
    order_id?: string
  } | null
}

type MoyasarWebhook = {
  type?: string
  secret_token?: string
  data?: MoyasarPayment
}

const CARD_PAYMENT_METHODS = ['Visa', 'MasterCard', 'Mada']

function secretsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received)
  const expectedBuffer = Buffer.from(expected)

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  )
}

async function fetchMoyasarPayment(paymentId: string) {
  const secretKey = process.env.MOYASAR_SECRET_KEY

  if (!secretKey) return null

  const response = await fetch(
    `https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) return null

  return (await response.json()) as MoyasarPayment
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.MOYASAR_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('MOYASAR_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 })
    }

    const webhook = (await request.json()) as MoyasarWebhook

    if (
      !webhook.secret_token ||
      !secretsMatch(webhook.secret_token, webhookSecret)
    ) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 })
    }

    if (!['payment_paid', 'payment_failed'].includes(webhook.type || '')) {
      return NextResponse.json({ received: true })
    }

    const notifiedPayment = webhook.data
    const paymentId = String(notifiedPayment?.id || '')
    const orderId = String(notifiedPayment?.metadata?.order_id || '')

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: 'Invalid payment event' }, { status: 400 })
    }

    const payment = await fetchMoyasarPayment(paymentId)

    if (!payment) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 502 })
    }

    const supabase = createAdminClient()
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
      payment.amount !== expectedAmount ||
      payment.currency?.toUpperCase() !== 'SAR' ||
      paymentOrderId !== order.id
    ) {
      return NextResponse.json({ error: 'Payment does not match order' }, { status: 400 })
    }

    if (webhook.type === 'payment_failed') {
      if (payment.status !== 'failed') {
        return NextResponse.json({ error: 'Payment status mismatch' }, { status: 400 })
      }

      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', orderId)
        .eq('payment_status', 'unpaid')

      return NextResponse.json({ success: true })
    }

    if (payment.status !== 'paid') {
      return NextResponse.json({ error: 'Payment is not paid' }, { status: 400 })
    }

    const { data: updatedOrders, error: updateError } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'processing' })
      .eq('id', orderId)
      .eq('payment_status', 'unpaid')
      .select('id')

    if (updateError) {
      return NextResponse.json({ error: 'Order update failed' }, { status: 500 })
    }

    if (!updatedOrders?.length) {
      const { data: latestOrder } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('id', orderId)
        .single()

      if (latestOrder?.payment_status === 'paid') {
        return NextResponse.json({ success: true, duplicate: true })
      }

      return NextResponse.json({ error: 'Order payment state changed' }, { status: 409 })
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
        console.error('Webhook email error:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
