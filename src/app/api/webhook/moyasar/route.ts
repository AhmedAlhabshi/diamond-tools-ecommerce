import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendOrderEmails } from '@/lib/email'

export async function POST(req: Request) {

  try {
    const body = await req.json()

    console.log("Webhook received:", body)

    const payment = body

    if (payment.status !== "paid") {
      return NextResponse.json({ received: true })
    }

    const orderId = payment.metadata?.order_id

    if (!orderId) {
      console.error("No order_id in metadata")
      return NextResponse.json({ error: "No order id" })
    }

    const supabase = await createClient()

    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing"
      })
      .eq("id", orderId)

    const { data: order } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          product:products (name_en)
        )
      `)
      .eq("id", orderId)
      .single()

    await sendOrderEmails(order)

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}