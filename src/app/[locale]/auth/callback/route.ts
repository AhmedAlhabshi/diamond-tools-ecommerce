export const runtime = "nodejs"

import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type")
  const requestedNext = url.searchParams.get("next")
  const locale = url.pathname.split("/")[1] || "en"
  const safeNext =
    requestedNext?.startsWith(`/${locale}/`) &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\")
      ? requestedNext
      : null

  const supabase = await createClient()
  let authenticated = false

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    })

    if (error) {
      console.error("Recovery callback error:", error.message)
      return NextResponse.redirect(
        new URL(`/${locale}/forgot-password`, request.url)
      )
    }

    authenticated = true
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error.message)
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    authenticated = true
  }

  if (authenticated && safeNext) {
    return NextResponse.redirect(new URL(safeNext, request.url))
  }

  await supabase.auth.signOut()
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
}
