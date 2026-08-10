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

    if (!fromEmail || fromEmail.includes('@resend.dev') || !adminEmail) {
      throw new Error('Contact email environment variables are not configured')
    }

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message)}</p>
      `
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