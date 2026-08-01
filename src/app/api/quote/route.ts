import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: FormDataEntryValue | null) {
  return String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const company = formData.get("company");
    const phone = formData.get("phone");
    const message = formData.get("message");
    const file = formData.get("file") as File | null;

    const attachments: { filename: string; content: Buffer }[] = [];

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
    const adminEmail = process.env.ADMIN_EMAIL?.trim();

    if (!fromEmail || fromEmail.includes("@resend.dev") || !adminEmail) {
      throw new Error("Quote email environment variables are not configured");
    }

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: "New Quote Request",
      html: `
        <h2>New Quote Request</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Company:</b> ${escapeHtml(company)}</p>
        <p><b>Phone:</b> ${escapeHtml(phone)}</p>
        <p><b>Message:</b> ${escapeHtml(message)}</p>
      `,
      attachments,
    });

    if (error) {
      throw new Error(`Quote email failed: ${error.message}`);
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}