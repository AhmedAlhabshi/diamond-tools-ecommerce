'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { getPaymentOrder } from '@/app/actions/payment'

declare global {
  interface Window {
    Moyasar: {
      init(options: {
        element: string
        amount: number
        currency: string
        description: string
        publishable_api_key: string | undefined
        callback_url: string
        methods: string[]
        supported_networks: string[]
        metadata: { order_id: string }
        on_failure(error: string): Promise<void>
      }): void
    }
  }
}

export default function PaymentPage() {
  const t = useTranslations('PaymentPage')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')

  useEffect(() => {
    let cancelled = false
    let stylesheet: HTMLLinkElement | null = null
    let script: HTMLScriptElement | null = null

    const initializePayment = async () => {
      if (!orderId) {
        setStatus('failed')
        return
      }

      const order = await getPaymentOrder(orderId)

      if (cancelled || !order.success || !order.total || !order.orderId) {
        if (!cancelled) setStatus('failed')
        return
      }

      stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.href =
        'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.10/dist/moyasar.css'
      document.head.appendChild(stylesheet)

      script = document.createElement('script')
      script.src =
        'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.10/dist/moyasar.umd.min.js'
      script.async = true
      script.onload = () => {
        if (cancelled) return

        window.Moyasar.init({
          element: '.mysr-form',
          amount: Math.round(order.total * 100),
          currency: 'SAR',
          description: t('description'),
          publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_KEY,
          callback_url: `${window.location.origin}/${locale}/payment/success?order_id=${order.orderId}`,
          methods: ['creditcard'],
          supported_networks: ['visa', 'mastercard', 'mada'],
          metadata: { order_id: order.orderId },
          on_failure: async () => {
            window.location.href = `/${locale}/payment/failed`
          },
        })
        setStatus('ready')
      }
      script.onerror = () => {
        if (!cancelled) setStatus('failed')
      }
      document.body.appendChild(script)
    }

    void initializePayment()

    return () => {
      cancelled = true
      script?.remove()
      stylesheet?.remove()
    }
  }, [locale, orderId, t])

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('title')}</h1>

        {status === 'loading' && (
          <p className="text-center text-slate-500">
            {locale === 'ar' ? 'جاري تجهيز الدفع الآمن...' : 'Preparing secure payment...'}
          </p>
        )}

        {status === 'failed' && (
          <p className="text-center text-red-600">
            {locale === 'ar'
              ? 'تعذر تحميل الطلب للدفع. يرجى العودة إلى السلة والمحاولة مرة أخرى.'
              : 'This order cannot be loaded for payment. Please return to the cart and try again.'}
          </p>
        )}

        <div className={status === 'failed' ? 'hidden' : 'mysr-form'} />
      </div>
    </div>
  )
}
