'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendOrderEmails } from '@/lib/email'
import { getDeliveryFee } from '@/lib/delivery'
import { randomUUID } from 'crypto'

const MAX_BANK_SLIP_SIZE = 5 * 1024 * 1024
const CARD_PAYMENT_METHODS = ['Visa', 'MasterCard', 'Mada']
const BANK_SLIP_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

function hasValidBankSlipSignature(type: string, bytes: Uint8Array) {
  if (type === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }

  if (type === 'image/png') {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    )
  }

  if (type === 'image/webp') {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    )
  }

  if (type === 'application/pdf') {
    return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-'
  }

  return false
}

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
  const shortAddress = String(formData.get('short_address') || '')
    .trim()
    .toUpperCase()
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const paymentMethod = formData.get('payment_method') as string
  const deliveryNotes = formData.get('delivery_notes') as string
  const bankSlip = formData.get('bank_slip')

  const fulfillmentMethod =
    (formData.get('fulfillment_method') as string) || 'delivery'

  const pickupBranch =
    (formData.get('pickup_branch') as string) || null
  let bankSlipBytes: Uint8Array | null = null

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
    if (!city || !district || !street || !phone || !shortAddress) {
      return { error: 'Missing required address fields' }
    }

    if (!/^[A-Z]{4}\d{4}$/.test(shortAddress)) {
      return { error: 'Short address must contain 4 letters followed by 4 numbers' }
    }
  }

  if (fulfillmentMethod === 'pickup') {
    if (!pickupBranch) {
      return { error: 'Please select a pickup branch' }
    }
  }

  if (paymentMethod === 'Bank Transfer') {
    if (!(bankSlip instanceof File) || bankSlip.size === 0) {
      return { error: 'Bank transfer receipt is required' }
    }

    if (bankSlip.size > MAX_BANK_SLIP_SIZE) {
      return { error: 'Bank transfer receipt must not exceed 5 MB' }
    }

    if (!BANK_SLIP_TYPES[bankSlip.type]) {
      return { error: 'Bank transfer receipt must be a JPG, PNG, WebP, or PDF file' }
    }

    bankSlipBytes = new Uint8Array(await bankSlip.arrayBuffer())

    if (!hasValidBankSlipSignature(bankSlip.type, bankSlipBytes)) {
      return { error: 'Bank transfer receipt file content is invalid' }
    }
  }

  // =========================
  // 🔒 SERVER-SIDE PRICING
  // =========================
  const pricedItems = []

  for (const item of items) {
    const quantity = Number(item.quantity)
    const productId = String(item.product_id || '')
    const variantId = String(item.variant_id || '')

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return { error: 'Invalid cart item' }
    }

    let price: number
    let productCode: string | null = null
    let variantCode: string | null = null

    if (variantId && variantId !== 'default') {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('id, product_id, price, variant_code, product:products(product_code)')
        .eq('id', variantId)
        .eq('product_id', productId)
        .single()

      price = Number(variant?.price)
      const variantProduct = Array.isArray(variant?.product)
        ? variant.product[0]
        : variant?.product
      productCode = variantProduct?.product_code || null
      variantCode = variant?.variant_code || null

      if (variantError || !variant || !Number.isFinite(price) || price < 0) {
        return { error: 'Product option is no longer available' }
      }
    } else {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, individual_price, is_active, product_code')
        .eq('id', productId)
        .eq('is_active', true)
        .single()

      price = Number(product?.individual_price)
      productCode = product?.product_code || null

      if (productError || !product || !Number.isFinite(price) || price < 0) {
        return { error: 'Product is no longer available' }
      }
    }

    pricedItems.push({
      product_id: productId,
      quantity,
      price,
      product_code: productCode,
      variant_code: variantCode,
    })
  }

  // =========================
  // 💳 PAYMENT STATUS
  // =========================
  let paymentStatus = 'unpaid'

  if (paymentMethod === 'Bank Transfer') {
    paymentStatus = 'awaiting_transfer'
  }

  if (paymentMethod === 'Pay on Pickup') {
    paymentStatus = 'pay_on_pickup'
  }

  // =========================
  // 💰 CALCULATE TOTAL
  // =========================
  const subtotal = pricedItems.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  const deliveryFee =
    fulfillmentMethod === 'pickup' ? 0 : getDeliveryFee(subtotal)

  const vat = (subtotal + deliveryFee) * 0.15
  const total = subtotal + deliveryFee + vat

  if (
    CARD_PAYMENT_METHODS.includes(paymentMethod) &&
    Math.round(total * 100) < 100
  ) {
    return {
      error:
        'The minimum card payment is SAR 1. Please increase the quantity or add another product.',
    }
  }

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
      short_address: fulfillmentMethod === 'delivery' ? shortAddress : null,
      phone,
      email,
      delivery_notes: deliveryNotes
    })
    .select()
    .single()

  if (error || !order) {
    return { error: error?.message || 'Failed to create order' }
  }

  let bankSlipPath: string | null = null
  const admin = createAdminClient()

  async function cleanupFailedOrder() {
    if (bankSlipPath) {
      await admin.storage.from('bank-slips').remove([bankSlipPath])
    }

    await admin.from('order_items').delete().eq('order_id', order.id)
    await admin.from('orders').delete().eq('id', order.id)
  }

  if (
    paymentMethod === 'Bank Transfer' &&
    bankSlip instanceof File &&
    bankSlipBytes
  ) {
    const extension = BANK_SLIP_TYPES[bankSlip.type]
    bankSlipPath = `${order.id}/${randomUUID()}.${extension}`

    const { error: uploadError } = await admin.storage
      .from('bank-slips')
      .upload(bankSlipPath, bankSlipBytes, {
        contentType: bankSlip.type,
        upsert: false,
      })

    if (uploadError) {
      await cleanupFailedOrder()
      return { error: 'Failed to upload bank transfer receipt' }
    }

    const { error: receiptUpdateError } = await admin
      .from('orders')
      .update({ bank_slip_path: bankSlipPath })
      .eq('id', order.id)

    if (receiptUpdateError) {
      await cleanupFailedOrder()
      return { error: 'Failed to save bank transfer receipt' }
    }
  }

  // =========================
  // 📦 INSERT ORDER ITEMS
  // =========================
  const orderItems = pricedItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    product_code: item.product_code,
    variant_code: item.variant_code,
  }))

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (orderItemsError?.code === 'PGRST204') {
    const legacyOrderItems = orderItems.map((item) => ({
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))
    const { error: legacyInsertError } = await supabase
      .from('order_items')
      .insert(legacyOrderItems)

    if (legacyInsertError) {
      await cleanupFailedOrder()
      return { error: 'Failed to save order items' }
    }
  } else if (orderItemsError) {
    await cleanupFailedOrder()
    return { error: 'Failed to save order items' }
  }

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
          product:products (name_en, name_ar, product_code)
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
    orderId: order.id,
    total
  }
}
