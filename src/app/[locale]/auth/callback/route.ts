export const runtime = "nodejs"

import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next")
  const locale = url.pathname.split("/")[1] || "en"

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error.message)
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
  }

  if (next) {
    return NextResponse.redirect(new URL(next, request.url))
  }

  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
}