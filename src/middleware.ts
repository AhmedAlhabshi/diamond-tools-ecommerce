import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from '@/utils/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
})

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // redirect root to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url))
  }

  // Run i18n middleware
  const response = intlMiddleware(request)

  // Refresh Supabase session
  const supabaseResponse = await updateSession(request)

  // Copy all cookies (including options)
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie)
  })

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}