export const runtime = "nodejs"

import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const requestedNext = url.searchParams.get("next")
  const locale = url.pathname.split("/")[1] || "en"
  const safeNext =
    requestedNext?.startsWith(`/${locale}/`) &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\")
      ? requestedNext
      : null

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error.message)
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
  }

  if (safeNext) {
    return NextResponse.redirect(new URL(safeNext, request.url))
  }

  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
}
