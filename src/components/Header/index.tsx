'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import DesktopHeader from './DesktopHeader'
import MobileHeader from './MobileHeader'

export default function Header() {
  const locale = useLocale()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) return <MobileHeader locale={locale} />
  return <DesktopHeader locale={locale} />
}