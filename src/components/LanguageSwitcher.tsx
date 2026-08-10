'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Globe2 } from 'lucide-react'
import { Suspense } from 'react'

function LanguageSwitcherContent() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const nextLocale = locale === 'ar' ? 'en' : 'ar'

  const handleSwitch = () => {
    const queryString = searchParams.toString()
    const href = queryString ? `${pathname}?${queryString}` : pathname

    router.push(href, { locale: nextLocale })
  }

  return (
    <button
      onClick={handleSwitch}
      className="
        flex items-center gap-2
        px-3 py-1.5
        rounded-full
        bg-white border border-gray-200
        text-gray-700 text-xs font-medium
        hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
        transition-all
        shadow-sm
      "
    >
      <Globe2 className="w-3.5 h-3.5" />

      <span>
        {locale === 'ar' ? 'English' : 'العربية'}
      </span>
    </button>
  )
}
export default function LanguageSwitcher() {
  return (
    <Suspense fallback={<span className="inline-block h-8 w-24 rounded-full border border-gray-200 bg-white shadow-sm" />}>
      <LanguageSwitcherContent />
    </Suspense>
  )
}