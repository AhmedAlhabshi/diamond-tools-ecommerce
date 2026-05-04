import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderEmails(order: any) {

  const isPickup = order.fulfillment_method === "pickup"

  const itemsHtml = (order.order_items || [])
    .map((item: any) => `
      <tr>
        <td style="padding:8px 0;">${item.product?.name_en || '-'}</td>
        <td style="padding:8px 0;">${item.quantity}</td>
        <td style="padding:8px 0;">SAR ${Number(item.price || 0).toFixed(2)}</td>
      </tr>
    `)
    .join('')

  const total = Number(order.total || 0).toFixed(2)

  // =========================
  // 📩 ADMIN EMAIL
  // =========================
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: [process.env.ADMIN_EMAIL!],
    subject: `🛒 New Order #${order.id}`,

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">

        <h2>New Order Received</h2>

        <p><strong>Order ID:</strong> ${order.id}</p>
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
        `}

        <hr/>

        <h3>Customer Info</h3>
        <p><strong>Name:</strong> ${order.name || '-'}</p>
        <p><strong>Email:</strong> ${order.email || '-'}</p>
        <p><strong>Phone:</strong> ${order.phone || '-'}</p>

        <hr/>

        <h3>Items</h3>

        <table width="100%" style="border-collapse:collapse">
          <thead>
            <tr style="text-align:left;border-bottom:1px solid #ddd">
              <th>Product</th>
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
  })

  // =========================
  // 📩 CUSTOMER EMAIL
  // =========================
  if (order.email) {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [order.email],
      subject: `Order Confirmation #${order.id}`,

      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">

          <h2>Thank you for your order 🙌</h2>

          <p>Your order has been received successfully.</p>

          <p><strong>Order ID:</strong> ${order.id}</p>
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

          <p><strong>رقم الطلب:</strong> ${order.id}</p>
          <p><strong>الإجمالي:</strong> ${total} ريال</p>

          ${isPickup ? `
            <p><strong>فرع الاستلام:</strong> ${order.pickup_branch}</p>
            <p>سيتم إشعارك عندما يكون طلبك جاهزًا للاستلام.</p>
          ` : `
            <p>سيتم توصيل الطلب إلى عنوانك.</p>
          `}

        </div>
      `,
    })
  }
}

export async function sendOrderStatusEmail(order: any, newStatus: string) {
  if (!order.email) return

  const isPickup = order.fulfillment_method === "pickup"

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

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: [order.email],
    subject: `Order Update #${order.id}`,

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">

        <h2>Order Status Update</h2>

        <p>${message.en}</p>

        <p><strong>Order ID:</strong> ${order.id}</p>
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

          <p><strong>رقم الطلب:</strong> ${order.id}</p>
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