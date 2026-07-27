'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'
import { isStrongEnoughPassword } from '@/lib/password-policy'

const resend = new Resend(process.env.RESEND_API_KEY)

function getSafeLocale(formData: FormData) {
  return formData.get("locale") === "ar" ? "ar" : "en"
}

// ================= LOGIN =================

export async function login(formData: FormData) {

  const supabase = await createClient()

  const locale = getSafeLocale(formData)

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  redirect(`/${locale}/dashboard`)
}



// ================= SIGNUP INDIVIDUAL =================

export async function signupIndividual(formData: FormData) {
  const supabase = await createClient()

  const locale = getSafeLocale(formData)
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/callback`
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (!isStrongEnoughPassword(password)) {
    return {
      error: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
    }
  }

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        city: formData.get("city") as string,
        address: formData.get("address") as string,
        user_type: "individual",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(`/${locale}/verify-email`)
}


// ================= SIGNUP COMPANY =================

export async function signupCompany(formData: FormData) {

  const supabase = await createClient()

  const locale = getSafeLocale(formData)

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!isStrongEnoughPassword(password)) {
    return {
      error: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/callback`,
      data: {
        name: formData.get('contact_person') as string,
        phone: formData.get('phone') as string,
        company_name: formData.get('company_name') as string,
        cr_number: formData.get('cr_number') as string,
        vat_number: formData.get('vat_number') as string,
        national_address: formData.get('national_address') as string,

        // FIXED HERE
        cr_file: formData.get('cr_file'),
        vat_file: formData.get('vat_file'),
        national_file: formData.get('national_file'),

        user_type: 'company',
        status: 'pending'
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Send Admin Email
  await resend.emails.send({
    from: 'Diamond Tools <onboarding@resend.dev>',
    to: process.env.ADMIN_EMAIL!,
    subject: 'New Company Registration',
    html: `
      <h2>New Company Registered</h2>
      <p><strong>Company:</strong> ${formData.get('company_name')}</p>
      <p><strong>Email:</strong> ${formData.get('email')}</p>
    `
  })

  redirect(`/${locale}/verify-email`)
}



// ================= LOGOUT =================

export async function logout(formData: FormData) {

  const supabase = await createClient()

  const locale = getSafeLocale(formData)

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')

  redirect(`/${locale}/login`)
}


export async function changePassword(formData: FormData) {

  const supabase = await createClient()

  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!isStrongEnoughPassword(password)) {
    return {
      error: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
    }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  const { error } = await supabase.auth.updateUser({
    password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
