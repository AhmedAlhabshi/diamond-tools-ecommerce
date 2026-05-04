"use client"

import { ShoppingCart } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useLocale } from "next-intl"

export default function CartIcon({ count = 0 }: { count?: number }) {

  const locale = useLocale()

  return (
    <Link href="/cart" locale={locale} className="relative">

      <ShoppingCart className="w-6 h-6 text-slate-600 hover:text-blue-700" />

      {/* 🔥 Badge */}
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}

    </Link>
  )
}