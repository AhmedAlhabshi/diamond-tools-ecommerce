'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getAdminStats() {
  const supabase = createAdminClient()

  const [
    { count: productsCount },
    { count: ordersCount },
    { count: usersCount },
    { data: ordersData }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total')
  ])

  const totalSales = ordersData?.reduce(
    (acc, order) => acc + (order.total || 0),
    0
  ) || 0

  return {
    products: productsCount || 0,
    orders: ordersCount || 0,
    customers: usersCount || 0,
    sales: totalSales
  }
}



export async function approveCompany(formData: FormData) {

  const id = formData.get("id") as string

  const supabase = createAdminClient()

  // Get company email
  const { data: company } = await supabase
    .from("users")
    .select("email, company_name")
    .eq("id", id)
    .single()

  // Update status
  await supabase
    .from("users")
    .update({ company_status: "approved" })
    .eq("id", id)

  // Send Email
  if (company?.email) {
    await resend.emails.send({
      from: 'Diamond Tools <onboarding@resend.dev>',
      to: company.email,
      subject: 'Your Company Has Been Approved',
      html: `
        <h2>Your Company is Approved 🎉</h2>
        <p>Hello ${company.company_name || ''}</p>

        <p>Your account has been approved.</p>

        <p>You can now login and send quote requests.</p>

        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login">
          Login Now
        </a>
      `
    })
  }

  revalidatePath("/admin/companies")
}



export async function rejectCompany(formData: FormData) {

  const id = formData.get("id") as string

  const supabase = createAdminClient()

  const { data: company } = await supabase
    .from("users")
    .select("email, company_name")
    .eq("id", id)
    .single()

  await supabase
    .from("users")
    .update({ company_status: "rejected" })
    .eq("id", id)

  // Send rejection email
  if (company?.email) {
    await resend.emails.send({
      from: 'Diamond Tools <onboarding@resend.dev>',
      to: company.email,
      subject: 'Company Registration Rejected',
      html: `
        <h2>Company Registration Rejected</h2>

        <p>Hello ${company.company_name || ''}</p>

        <p>Unfortunately your company registration was rejected.</p>

        <p>Please contact support for more information.</p>
      `
    })
  }

  revalidatePath("/admin/companies")
}