'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { Resend } from "resend"
import { revalidatePath } from "next/cache"

const resend = new Resend(process.env.RESEND_API_KEY)


// ==============================
// Send Quote Request
// ==============================

export async function sendQuoteRequest() {

const supabase = await createClient()

const {
data: { user }
} = await supabase.auth.getUser()

if (!user) return

// get cart items

const { data: cartItems } = await supabase
.from("quote_cart")
.select("*")
.eq("user_id", user.id)

if (!cartItems?.length) return

// create quote

const { data: quote, error: quoteError } = await supabase
.from("quote_requests")
.insert({
user_id: user.id,
status: "pending"
})
.select()
.single()

if (quoteError) {
console.error("Quote Error:", quoteError)
return
}

// send email to admin

await resend.emails.send({
from: "Diamond Tools <onboarding@resend.dev>",
to: process.env.ADMIN_EMAIL!,
subject: "New Quote Request",
html: `
<h2>New Quote Request</h2>
<p>A company has submitted a new quote request.</p>
`
})

// insert items

for (const item of cartItems) {

await supabase
.from("quote_request_items")
.insert({
quote_id: quote.id,
product_id: item.product_id,
quantity: item.quantity
})

}

// clear cart

await supabase
.from("quote_cart")
.delete()
.eq("user_id", user.id)

const locale = await getLocale()

redirect(`/${locale}/quote`)

}



// ==============================
// Approve Quote
// ==============================

export async function contactQuote(formData: FormData) {

const id = formData.get("id") as string

const supabase = await createClient()

// update status

await supabase
.from("quote_requests")
.update({ status: "contacted" })
.eq("id", id)


// get user email

const { data: quote } = await supabase
.from("quote_requests")
.select(`
users:user_id (
email,
company_name
)
`)
.eq("id", id)
.single()


// send email

await resend.emails.send({
from: "Diamond Tools <onboarding@resend.dev>",
to: (quote as any)?.users?.email,
subject: "Quote Approved",
html: `
<h2>Your Quote Request Contacted</h2>
<p>We have contacted you.</p>
<p>We will send your quotation shortly.</p>
`
})

revalidatePath("/admin/quotes")

}



// ==============================
// Reject Quote
// ==============================

export async function closedQuote(formData: FormData) {

const id = formData.get("id") as string

const supabase = await createClient()

// update status

await supabase
.from("quote_requests")
.update({ status: "Closed" })
.eq("id", id)


// get user email

const { data: quote } = await supabase
.from("quote_requests")
.select(`
users:user_id (
email,
company_name
)
`)
.eq("id", id)
.single()


// send email

await resend.emails.send({
from: "Diamond Tools <onboarding@resend.dev>",
to: (quote as any)?.users?.email,
subject: "Quote Rejected",
html: `
<h2>Your Quote Request Closed</h2>
<p>Your quote request has been Closed.</p>
<p>Please contact us for more information.</p>
`
})

revalidatePath("/admin/quotes")

}