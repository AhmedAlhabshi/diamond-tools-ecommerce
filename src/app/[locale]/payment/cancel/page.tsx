'use client'

import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'

export default function PaymentCancel() {

  const t = useTranslations("PaymentCancel")
  const locale = useLocale()

  const router = useRouter()

  return (

    <div className="max-w-3xl mx-auto py-20 text-center">

      <h1 className="text-3xl font-bold text-yellow-600 mb-4">
        {t("title")}
      </h1>

      <p className="text-gray-600 mb-6">
        {t("description")}
      </p>

      <button
        onClick={() => router.push(`/${locale}/cart`)}
        className="bg-brand-blue text-white px-6 py-3 rounded-lg"
      >
        {t("button")}
      </button>

    </div>

  )

}