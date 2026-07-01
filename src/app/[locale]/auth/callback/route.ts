export const runtime = "nodejs"

import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const locale = url.pathname.split("/")[1] || "en"

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error.message)
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (!existingUser) {
    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      name: user.user_metadata?.name ?? null,
      email: user.email ?? null,
      phone: user.user_metadata?.phone ?? null,
      user_type: user.user_metadata?.user_type ?? "individual",
      company_name: user.user_metadata?.company_name ?? null,
      cr_number: user.user_metadata?.cr_number ?? null,
      vat_number: user.user_metadata?.vat_number ?? null,
      national_address: user.user_metadata?.national_address ?? null,
      cr_file: user.user_metadata?.cr_file ?? null,
      vat_file: user.user_metadata?.vat_file ?? null,
      national_address_file: user.user_metadata?.national_file ?? null,
      company_status:
        user.user_metadata?.user_type === "company" ? "pending" : "approved",
    })

    if (insertError) {
      console.error("User insert error:", insertError.message)
    }
  }

  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
}