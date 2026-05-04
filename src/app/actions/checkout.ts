'use server'

import { createClient } from '@/utils/supabase/server'
import { sendOrderEmails } from '@/lib/email'
import { getDeliveryFee } from '@/lib/delivery'

export async function processCheckout(items: any[], formData: FormData) {

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user?.id || null

  // =========================
  // 📥 FORM DATA
  // =========================
  const name = formData.get('name') as string
  const city = formData.get('city') as string
  const district = formData.get('district') as string
  const street = formData.get('street') as string
  const building = formData.get('building') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const paymentMethod = formData.get('payment_method') as string
  const deliveryNotes = formData.get('delivery_notes') as string

  const fulfillmentMethod =
    (formData.get('fulfillment_method') as string) || 'delivery'

  const pickupBranch =
    (formData.get('pickup_branch') as string) || null

  // =========================
  // 🛑 VALIDATION
  // =========================
  if (!items || items.length === 0) {
    return { error: 'Cart is empty' }
  }

  if (!name || !phone || !email) {
    return { error: 'Missing customer information' }
  }

  if (fulfillmentMethod === 'delivery') {
    if (!city || !district || !street || !phone) {
      return { error: 'Missing required address fields' }
    }
  }

  if (fulfillmentMethod === 'pickup') {
    if (!pickupBranch) {
      return { error: 'Please select a pickup branch' }
    }
  }

  // =========================
  // 💳 PAYMENT STATUS
  // =========================
  let paymentStatus = 'paid'

  if (paymentMethod === 'Bank Transfer') {
    paymentStatus = 'awaiting_transfer'
  }

  if (paymentMethod === 'Pay on Pickup') {
    paymentStatus = 'pay_on_pickup'
  }

  // =========================
  // 💰 CALCULATE TOTAL
  // =========================
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 0)
  }, 0)

  const deliveryFee =
    fulfillmentMethod === 'pickup' ? 0 : getDeliveryFee(subtotal)

  const vat = (subtotal + deliveryFee) * 0.15
  const total = subtotal + deliveryFee + vat

  // =========================
  // 🧾 CREATE ORDER
  // =========================
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      customer_name: name,
      status: 'pending_approval',
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      fulfillment_method: fulfillmentMethod,
      pickup_branch: pickupBranch,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      city: fulfillmentMethod === 'delivery' ? city : null,
      district: fulfillmentMethod === 'delivery' ? district : null,
      street: fulfillmentMethod === 'delivery' ? street : null,
      building: fulfillmentMethod === 'delivery' ? building : null,
      phone,
      email,
      delivery_notes: deliveryNotes
    })
    .select()
    .single()

  if (error || !order) {
    return { error: error?.message || 'Failed to create order' }
  }

  // =========================
  // 📦 INSERT ORDER ITEMS
  // =========================
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }))

  await supabase.from('order_items').insert(orderItems)

  // =========================
  // 📧 SEND EMAIL
  // =========================
  if (paymentMethod === 'Bank Transfer' || paymentMethod === 'Pay on Pickup') {

    const { data: fullOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (name_en)
        )
      `)
      .eq('id', order.id)
      .single()

    if (fullOrder) {
      try {
        await sendOrderEmails(fullOrder)
      } catch (err) {
        console.error("Email error:", err)
      }
    }
  }

  return {
    success: true,
    orderId: order.id
  }
}