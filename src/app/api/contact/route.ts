import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function normalizeLineBreaks(value: unknown) {
  return escapeHtml(value).replaceAll(/\r?\n/g, '<br>')
}

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
    const adminEmail = process.env.ADMIN_EMAIL?.trim()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

    if (!fromEmail || fromEmail.includes('@resend.dev') || !adminEmail || !siteUrl) {
      throw new Error('Contact email environment variables are not configured')
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = normalizeLineBreaks(message)
    const logoUrl = new URL('/diamond-tools-logo.png', siteUrl).toString()
    const subjectName = String(name).replaceAll(/[\r\n]/g, ' ').trim().slice(0, 80)

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: email,
      subject: `Website enquiry — ${subjectName}`,
      text: [
        'New website enquiry',
        '',
        `Name: ${String(name)}`,
        `Email: ${String(email)}`,
        '',
        'Message:',
        String(message),
        '',
        'Submitted through the Diamond Tools website contact form.',
      ].join('\n'),
      html: `
        <!doctype html>
        <html lang="en">
          <body style="margin:0;padding:0;background:#f3f6fa;font-family:Arial,Helvetica,sans-serif;color:#172033;">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
              New website enquiry from ${safeName}
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fa;border-collapse:collapse;">
              <tr>
                <td align="center" style="padding:36px 16px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e3e8ef;border-radius:18px;overflow:hidden;border-collapse:separate;">
                    <tr>
                      <td style="padding:30px 32px 22px;text-align:center;border-bottom:1px solid #e8edf3;">
                        <img src="${logoUrl}" width="180" alt="Diamond Tools" style="display:block;width:180px;max-width:100%;height:auto;margin:0 auto;">
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:34px 32px;">
                        <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#eaf2ff;color:#1554ad;font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;">
                          Website contact
                        </div>
                        <h1 style="margin:16px 0 8px;font-size:27px;line-height:1.25;color:#101828;">
                          New customer enquiry
                        </h1>
                        <p style="margin:0 0 28px;color:#667085;font-size:15px;line-height:1.7;">
                          A visitor submitted the contact form on the Diamond Tools website.
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f8fafc;border:1px solid #e5eaf0;border-radius:12px;">
                          <tr>
                            <td style="padding:15px 18px;color:#667085;font-size:13px;border-bottom:1px solid #e5eaf0;width:90px;">Name</td>
                            <td style="padding:15px 18px;color:#101828;font-size:14px;font-weight:700;border-bottom:1px solid #e5eaf0;">${safeName}</td>
                          </tr>
                          <tr>
                            <td style="padding:15px 18px;color:#667085;font-size:13px;width:90px;">Email</td>
                            <td style="padding:15px 18px;font-size:14px;font-weight:700;">
                              <a href="mailto:${safeEmail}" style="color:#0f62c9;text-decoration:none;">${safeEmail}</a>
                            </td>
                          </tr>
                        </table>

                        <div style="margin-top:24px;">
                          <p style="margin:0 0 10px;color:#344054;font-size:13px;font-weight:700;">Message</p>
                          <div style="padding:20px;background:#f8fafc;border-left:4px solid #1769d2;border-radius:0 10px 10px 0;color:#344054;font-size:15px;line-height:1.75;">
                            ${safeMessage}
                          </div>
                        </div>

                        <div style="margin-top:28px;text-align:center;">
                          <a href="mailto:${safeEmail}" style="display:inline-block;padding:13px 24px;border-radius:10px;background:#1769d2;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
                            Reply to customer
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e8edf3;text-align:center;color:#667085;font-size:12px;line-height:1.6;">
                        Diamond Tools &amp; Equipment Est.<br>
                        Jeddah, Saudi Arabia · +966 54 601 0202
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      throw new Error(`Contact email failed: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
