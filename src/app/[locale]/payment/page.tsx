'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

declare global {
  interface Window {
    Moyasar: any
  }
}

export default function PaymentPage() {

  const t = useTranslations("PaymentPage")
  const locale = useLocale()

  const searchParams = useSearchParams()
  const amount = searchParams.get('amount') || '100'
  const orderId = searchParams.get('order_id')

  useEffect(() => {

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.moyasar.com/mpf/1.6.0/moyasar.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = "https://cdn.moyasar.com/mpf/1.6.0/moyasar.js"
    script.async = true

    script.onload = () => {

      window.Moyasar.init({

        element: '.mysr-form',

        amount: Number(amount) * 100,

        currency: 'SAR',

        description: t("description"),

        publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_KEY,

        callback_url: `${window.location.origin}/${locale}/payment/success?order_id=${orderId}`,

        methods: ['creditcard', 'mada'],

        metadata: {
          order_id: orderId
        }

      })
    }

    document.body.appendChild(script)

  }, [amount, locale])

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8">

        <h1 className="text-2xl font-bold mb-6 text-center">
          {t("title")}
        </h1>

        <div className="mysr-form"></div>

      </div>
    </div>
  )
}