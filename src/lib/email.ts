import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const LOGO_URL =
  'https://pqpnbjctpmicdrdijnap.supabase.co/storage/v1/object/public/logo/logo1.png'

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

function escapeHtml(value: unknown) {
  return String(value ?? '-')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatAmount(value: unknown) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
}

function detailRow(label: string, value: unknown) {
  return `
    <tr>
      <td style="padding:8px 0;color:#64748b;font-size:14px;">${label}</td>
      <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `
}

function emailLayout(title: string, content: string) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(title)}</div>
        <div style="max-width:620px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border-radius:16px;padding:36px 28px;border:1px solid #e5e7eb;">
            <div style="text-align:center;">
              <img
                src="${LOGO_URL}"
                alt="Diamond Tools"
                width="180"
                style="display:block;max-width:180px;width:100%;height:auto;margin:0 auto 24px;"
              />
            </div>

            ${content}

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">

            <div style="text-align:center;">
              <p style="margin:0;font-weight:700;font-size:15px;color:#111827;">
                Diamond Tools &amp; Equipment Est.
              </p>
              <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">
                Jeddah, Saudi Arabia
              </p>
              <p style="margin:6px 0 0;color:#6b7280;font-size:13px;">
                info@diamondtools-est.com | +966 54 601 0202
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

function orderItemsHtml(orderItems: any[]) {
  const rows = (orderItems || [])
    .map((item) => {
      const productName =
        item.product?.name_en || item.product?.name_ar || '-'
      const productCode =
        item.product_code || item.product?.product_code || '-'
      const variantCode = item.variant_code || '-'

      return `
        <tr>
          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
            <div style="font-weight:700;color:#0f172a;">${escapeHtml(productName)}</div>
            <div style="margin-top:5px;color:#64748b;font-size:12px;">
              ${escapeHtml(productCode)} / ${escapeHtml(variantCode)}
            </div>
          </td>
          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;text-align:center;vertical-align:top;">
            ${escapeHtml(item.quantity)}
          </td>
          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;vertical-align:top;">
            SAR ${formatAmount(item.price)}
          </td>
        </tr>
      `
    })
    .join('')

  return `
    <div style="margin-top:26px;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Order items | عناصر الطلب</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;color:#475569;font-size:12px;">
            <th style="padding:10px 8px;text-align:left;">Product / Code</th>
            <th style="padding:10px 8px;text-align:center;">Qty</th>
            <th style="padding:10px 8px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}

export async function sendOrderEmails(order: any) {
  const isPickup = order.fulfillment_method === 'pickup'
  const fromEmail = getFromEmail()
  const displayOrderId = String(order.id).slice(0, 8).toUpperCase()
  const total = formatAmount(order.total)
  const itemsHtml = orderItemsHtml(order.order_items)
  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const emailJobs: Promise<void>[] = []

  if (adminEmail) {
    const fulfillmentHtml = isPickup
      ? detailRow('Pickup branch', order.pickup_branch)
      : `
          ${detailRow('City / District', `${order.city || '-'} / ${order.district || '-'}`)}
          ${detailRow('Street / Building', `${order.street || '-'} / ${order.building || '-'}`)}
          ${detailRow('Short address', order.short_address)}
          ${detailRow('Delivery notes', order.delivery_notes || '-')}
        `

    emailJobs.push(
      sendEmail('Admin order', {
        from: fromEmail,
        to: [adminEmail],
        subject: `New Order #${displayOrderId}`,
        html: emailLayout(
          `New order #${displayOrderId}`,
          `
            <h1 style="margin:0 0 12px;text-align:center;font-size:28px;color:#0f172a;">
              New order received
            </h1>
            <p style="margin:0 0 28px;text-align:center;font-size:15px;line-height:1.7;color:#64748b;">
              A new order has been placed through the Diamond Tools store.
            </p>

            <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${detailRow('Order number', `#${displayOrderId}`)}
                ${detailRow('Total', `SAR ${total}`)}
                ${detailRow('Payment method', order.payment_method)}
                ${detailRow('Payment status', order.payment_status)}
                ${detailRow('Fulfillment', isPickup ? 'Pickup from store' : 'Delivery')}
              </table>
            </div>

            <h2 style="margin:26px 0 10px;font-size:18px;color:#0f172a;">Customer information</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${detailRow('Name', order.customer_name || order.name)}
              ${detailRow('Email', order.email)}
              ${detailRow('Phone', order.phone)}
              ${fulfillmentHtml}
            </table>

            ${itemsHtml}

            <div style="margin-top:24px;background:#0f62fe;border-radius:10px;padding:16px;text-align:center;color:#ffffff;">
              <span style="font-size:14px;">Order total</span>
              <strong style="display:block;margin-top:4px;font-size:22px;">SAR ${total}</strong>
            </div>
          `
        ),
      })
    )
  } else {
    console.error('Admin order email skipped: ADMIN_EMAIL is not configured')
  }

  if (order.email) {
    const fulfillmentEnglish = isPickup
      ? `You will be notified when your order is ready for collection from ${escapeHtml(order.pickup_branch)}.`
      : 'Your order will be prepared for delivery to the address provided.'
    const fulfillmentArabic = isPickup
      ? `سيتم إشعارك عندما يصبح طلبك جاهزًا للاستلام من ${escapeHtml(order.pickup_branch)}.`
      : 'سيتم تجهيز طلبك للتوصيل إلى العنوان المسجل.'

    emailJobs.push(
      sendEmail('Customer order confirmation', {
        from: fromEmail,
        to: [order.email],
        subject: `Order Confirmation #${displayOrderId}`,
        html: emailLayout(
          `Order confirmation #${displayOrderId}`,
          `
            <div dir="rtl" style="text-align:center;">
              <h1 style="margin:0 0 14px;font-size:28px;color:#0f172a;">
                تم استلام طلبك بنجاح
              </h1>
              <p style="margin:0;font-size:16px;line-height:1.8;color:#475569;">
                شكرًا لطلبك من <strong>مؤسسة الماسية للآلات والمعدات</strong>.
                سيتم إرسال تأكيد الطلب والفاتورة بعد اعتمادها.
              </p>
            </div>

            <div style="margin:28px 0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${detailRow('Order number | رقم الطلب', `#${displayOrderId}`)}
                ${detailRow('Total | الإجمالي', `SAR ${total}`)}
                ${detailRow('Payment | الدفع', order.payment_method)}
              </table>
            </div>

            <div dir="rtl" style="text-align:right;">
              <p style="margin:0;font-size:15px;line-height:1.8;color:#475569;">
                ${fulfillmentArabic}
              </p>
            </div>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:26px 0;">

            <div dir="ltr" style="text-align:left;">
              <h2 style="margin:0 0 10px;font-size:20px;color:#0f172a;">Order received successfully</h2>
              <p style="margin:0;font-size:15px;line-height:1.8;color:#475569;">
                Thank you for ordering from <strong>Diamond Tools &amp; Equipment Est.</strong>
                Your order confirmation and invoice will be sent after approval.
              </p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.8;color:#475569;">
                ${fulfillmentEnglish}
              </p>
            </div>

            ${itemsHtml}

            <div style="margin-top:24px;background:#0f62fe;border-radius:10px;padding:16px;text-align:center;color:#ffffff;">
              <span style="font-size:14px;">الإجمالي | Total</span>
              <strong style="display:block;margin-top:4px;font-size:22px;">SAR ${total}</strong>
            </div>
          `
        ),
      })
    )
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

  const isPickup = order.fulfillment_method === 'pickup'
  const fromEmail = getFromEmail()
  const displayOrderId = String(order.id).slice(0, 8).toUpperCase()

  const statusText: Record<string, { en: string; ar: string; label: string }> = {
    pending: {
      en: 'Your order is pending.',
      ar: 'طلبك قيد الانتظار.',
      label: 'Pending | قيد الانتظار',
    },
    pending_approval: {
      en: 'Your order is awaiting approval.',
      ar: 'طلبك بانتظار الاعتماد.',
      label: 'Pending approval | بانتظار الاعتماد',
    },
    processing: {
      en: 'Your order is now being processed.',
      ar: 'طلبك الآن قيد التجهيز.',
      label: 'Processing | قيد التجهيز',
    },
    ready: {
      en: isPickup
        ? 'Your order is ready for pickup.'
        : 'Your order is ready.',
      ar: isPickup ? 'طلبك جاهز للاستلام.' : 'طلبك جاهز.',
      label: 'Ready | جاهز',
    },
    completed: {
      en: 'Your order has been completed.',
      ar: 'تم إكمال طلبك بنجاح.',
      label: 'Completed | مكتمل',
    },
    cancelled: {
      en: 'Your order has been cancelled.',
      ar: 'تم إلغاء طلبك.',
      label: 'Cancelled | ملغي',
    },
  }

  const safeStatus = escapeHtml(newStatus)
  const message = statusText[newStatus] || {
    en: `Your order status has been updated to ${safeStatus}.`,
    ar: `تم تحديث حالة طلبك إلى ${safeStatus}.`,
    label: safeStatus,
  }

  const pickupDetails =
    isPickup && newStatus === 'ready'
      ? `
          <div style="margin-top:22px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;">
            <p dir="rtl" style="margin:0 0 8px;text-align:right;color:#1e3a8a;line-height:1.7;">
              يمكنك زيارة الفرع المحدد لاستلام طلبك:
              <strong>${escapeHtml(order.pickup_branch)}</strong>
            </p>
            <p style="margin:0;color:#1e3a8a;line-height:1.7;">
              Please visit <strong>${escapeHtml(order.pickup_branch)}</strong> to collect your order.
            </p>
          </div>
        `
      : ''

  await sendEmail('Customer order status', {
    from: fromEmail,
    to: [order.email],
    subject: `Order Update #${displayOrderId}`,
    html: emailLayout(
      `Order update #${displayOrderId}`,
      `
        <div dir="rtl" style="text-align:center;">
          <h1 style="margin:0 0 14px;font-size:28px;color:#0f172a;">تحديث حالة الطلب</h1>
          <p style="margin:0;font-size:16px;line-height:1.8;color:#475569;">${message.ar}</p>
        </div>

        <div style="margin:28px 0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${detailRow('Order number | رقم الطلب', `#${displayOrderId}`)}
            ${detailRow('Status | الحالة', message.label)}
          </table>
        </div>

        <div dir="ltr" style="text-align:left;">
          <h2 style="margin:0 0 10px;font-size:20px;color:#0f172a;">Order status update</h2>
          <p style="margin:0;font-size:15px;line-height:1.8;color:#475569;">${message.en}</p>
        </div>

        ${pickupDetails}
      `
    ),
  })
}
