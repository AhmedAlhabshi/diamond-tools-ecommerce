'use server'

import { createClient } from '@/utils/supabase/server'
import { sendOrderEmails } from '@/lib/email'

// ✅ VERIFY FROM MOYASAR
export async function verifyMoyasarPayment(paymentId: string) {

  const secretKey = process.env.MOYASAR_SECRET_KEY

  const res = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}`
    }
  })

  const data = await res.json()

  return data
}

// ✅ MARK ORDER PAID + SEND EMAIL
export async function markOrderPaid(orderId: string) {

  const supabase = await createClient()

  const { data: currentOrder } = await supabase
    .from('orders')
    .select('payment_status')
    .eq('id', orderId)
    .single()

  // ✅ prevent duplicate emails
  if (currentOrder?.payment_status === 'paid') {
    return
  }

  await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing'
    })
    .eq('id', orderId)

  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (name_en, name_ar)
      )
    `)
    .eq('id', orderId)
    .single()

  if (data) {
    await sendOrderEmails(data)
  }
}

// ✅ GET ORDER
export async function getOrderWithItems(orderId: string) {

  const supabase = await createClient()

  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (name_en, name_ar)
      )
    `)
    .eq('id', orderId)
    .single()

  return data
}