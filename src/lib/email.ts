import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailPayload = {
  from: string
  to: string[]
  subject: string
  html: string
}

function getFromEmail() {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()

  if (!fromEmail || fromEmail.includes('@resend.dev')) {
    throw new Error('RESEND_FROM_EMAIL must use a verified sending domain')
  }

  return fromEmail
}

async function sendEmail(label: string, payload: EmailPayload) {
  const { error } = await resend.emails.send(payload)

  if (error) {
    throw new Error(`${label} email failed: ${error.message}`)
  }
}

export async function sendOrderEmails(order: any) {

  const isPickup = order.fulfillment_method === "pickup"
  const fromEmail = getFromEmail()
  const displayOrderId = String(order.id).slice(0, 8).toUpperCase()

  const itemsHtml = (order.order_items || [])
    .map((item: any) => {
      const productCode = item.product_code || item.product?.product_code || '-'
      const variantCode = item.variant_code || '-'

      return `
      <tr>
        <td style="padding:8px 0;">${item.product?.name_en || '-'}</td>
        <td style="padding:8px 0;">${productCode}</td>
        <td style="padding:8px 0;">${variantCode}</td>
        <td style="padding:8px 0;">${item.quantity}</td>
        <td style="padding:8px 0;">SAR ${Number(item.price || 0).toFixed(2)}</td>
      </tr>
    `
    })
    .join('')

  const total = Number(order.total || 0).toFixed(2)

  // =========================
  // 📩 ADMIN EMAIL
  // =========================
  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const emailJobs: Promise<void>[] = []

  if (adminEmail) {
    emailJobs.push(sendEmail('Admin order', {
    from: fromEmail,
    to: [adminEmail],
    subject: `🛒 New Order #${displayOrderId}`,

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">

        <h2>New Order Received</h2>

        <p><strong>Order ID:</strong> #${displayOrderId}</p>
        <p><strong>Total:</strong> SAR ${total}</p>
        <p><strong>Payment:</strong> ${order.payment_method}</p>
        <p><strong>Status:</strong> ${order.payment_status}</p>
        <p><strong>Type:</strong> ${isPickup ? "Pickup from branch" : "Delivery"}</p>

        ${isPickup ? `
          <p><strong>Pickup Branch:</strong> ${order.pickup_branch}</p>
        ` : `
          <h3>Address</h3>
          <p>${order.city || '-'} - ${order.district || '-'}</p>
          <p>${order.street || '-'}</p>
          <p><strong>Short Address:</strong> ${order.short_address || '-'}</p>
        `}

        <hr/>

        <h3>Customer Info</h3>
        <p><strong>Name:</strong> ${order.customer_name || order.name || '-'}</p>
        <p><strong>Email:</strong> ${order.email || '-'}</p>
        <p><strong>Phone:</strong> ${order.phone || '-'}</p>

        <hr/>

        <h3>Items</h3>

        <table width="100%" style="border-collapse:collapse">
          <thead>
            <tr style="text-align:left;border-bottom:1px solid #ddd">
              <th>Product</th>
              <th>Product Code</th>
              <th>Variant Code</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h3 style="margin-top:20px">Total: SAR ${total}</h3>

      </div>
    `,
    }))
  } else {
    console.error('Admin order email skipped: ADMIN_EMAIL is not configured')
  }

  // =========================
  // 📩 CUSTOMER EMAIL
  // =========================
  if (order.email) {
    emailJobs.push(sendEmail('Customer order confirmation', {
      from: fromEmail,
      to: [order.email],
      subject: `Order Confirmation #${displayOrderId}`,

      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">

          <h2>Thank you for your order 🙌</h2>

          <p>Your order has been received successfully.</p>

          <p><strong>Order ID:</strong> #${displayOrderId}</p>
          <p><strong>Total:</strong> SAR ${total}</p>

          ${isPickup ? `
            <p><strong>Pickup from:</strong> ${order.pickup_branch}</p>
            <p>You will be notified when your order is ready.</p>
          ` : `
            <p>Your order will be delivered to your address.</p>
          `}

          <hr/>

          <h3>Items</h3>

          <table width="100%" style="border-collapse:collapse">
            <thead>
              <tr style="text-align:left;border-bottom:1px solid #ddd">
                <th>Product</th>
                <th>Product Code</th>
                <th>Variant Code</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <hr/>

          <!-- Arabic -->
          <h3 style="margin-top:30px">شكراً لطلبك 🙌</h3>

          <p>تم استلام طلبك بنجاح.</p>

          <p><strong>رقم الطلب:</strong> #${displayOrderId}</p>
          <p><strong>الإجمالي:</strong> ${total} ريال</p>

          ${isPickup ? `
            <p><strong>فرع الاستلام:</strong> ${order.pickup_branch}</p>
            <p>سيتم إشعارك عندما يكون طلبك جاهزًا للاستلام.</p>
          ` : `
            <p>سيتم توصيل الطلب إلى عنوانك.</p>
          `}

        </div>
      `,
    }))
  }

  const results = await Promise.allSettled(emailJobs)
  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  )

  for (const failure of failures) {
    console.error(failure.reason)
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} order email(s) failed`)
  }
}

export async function sendOrderStatusEmail(order: any, newStatus: string) {
  if (!order.email) return

  const isPickup = order.fulfillment_method === "pickup"
  const fromEmail = getFromEmail()
  const displayOrderId = String(order.id).slice(0, 8).toUpperCase()

  const statusText: Record<string, { en: string; ar: string }> = {
    pending: {
      en: "Your order is pending.",
      ar: "طلبك قيد الانتظار.",
    },
    processing: {
      en: "Your order is now being processed.",
      ar: "طلبك الآن قيد التجهيز.",
    },
    ready: {
      en: isPickup
        ? "Your order is ready for pickup."
        : "Your order is ready.",
      ar: isPickup
        ? "طلبك جاهز للاستلام."
        : "طلبك جاهز.",
    },
    completed: {
      en: "Your order has been completed.",
      ar: "تم إكمال طلبك بنجاح.",
    },
    cancelled: {
      en: "Your order has been cancelled.",
      ar: "تم إلغاء طلبك.",
    },
  }

  const message = statusText[newStatus] || {
    en: `Your order status has been updated to ${newStatus}.`,
    ar: `تم تحديث حالة طلبك إلى ${newStatus}.`,
  }

  await sendEmail('Customer order status', {
    from: fromEmail,
    to: [order.email],
    subject: `Order Update #${displayOrderId}`,

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">

        <h2>Order Status Update</h2>

        <p>${message.en}</p>

        <p><strong>Order ID:</strong> #${displayOrderId}</p>
        <p><strong>Status:</strong> ${newStatus}</p>

        ${
          isPickup && newStatus === "ready"
            ? `
              <p><strong>Pickup Branch:</strong> ${order.pickup_branch || "-"}</p>
              <p>Please visit the selected branch to collect your order.</p>
            `
            : ""
        }

        <hr/>

        <h2 dir="rtl" style="text-align:right">تحديث حالة الطلب</h2>

        <div dir="rtl" style="text-align:right">
          <p>${message.ar}</p>

          <p><strong>رقم الطلب:</strong> #${displayOrderId}</p>
          <p><strong>الحالة:</strong> ${newStatus}</p>

          ${
            isPickup && newStatus === "ready"
              ? `
                <p><strong>فرع الاستلام:</strong> ${order.pickup_branch || "-"}</p>
                <p>يمكنك زيارة الفرع المحدد لاستلام طلبك.</p>
              `
              : ""
          }
        </div>

      </div>
    `,
  })
}
