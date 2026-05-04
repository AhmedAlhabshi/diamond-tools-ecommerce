'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/store/useCart'
import { getOrderWithItems, verifyMoyasarPayment, markOrderPaid } from '@/app/actions/payment'
import { useTranslations, useLocale } from 'next-intl'
import { branches } from '@/lib/branches'


export default function PaymentSuccess() {

  const t = useTranslations("PaymentSuccess")
  const locale = useLocale()

  const searchParams = useSearchParams()
  

  const orderId = searchParams.get('order_id')
  const paymentId = searchParams.get('id')

  const { clearCart } = useCart()

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [order, setOrder] = useState<any>(null)

useEffect(() => {

  const load = async () => {

    if (!orderId || !paymentId) {
      setStatus('failed')
      return
    }

    try {

      const payment = await verifyMoyasarPayment(paymentId)

      if (payment.status !== "paid") {
        setStatus('failed')
        return
      }

      // ✅ mark as paid + send emails
      await markOrderPaid(orderId)

      // ✅ get updated order
      const data = await getOrderWithItems(orderId)

      if (!data) {
        setStatus('failed')
        return
      }

      setOrder(data)
      clearCart()
      setStatus('success')

    } catch (err) {
      console.error("Success page error:", err)
      setStatus('failed')
    }

  }

  load()

}, [])
  const isPickup = order?.fulfillment_method === "pickup"

  const branch = branches.find(
  (b) =>
    b.name_en === order?.pickup_branch ||
    b.name_ar === order?.pickup_branch
)

const whatsappLink = branch
  ? `https://wa.me/${branch.phone.replace(/\s+/g, '')}`
  : null

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-8">

      {/* Header */}
      <div className="text-center">

        <h1 className="text-3xl font-bold text-green-600 mb-2">
          {isPickup ? t("pickupSuccessTitle") : t("successTitle")}
        </h1>

        <p className="text-gray-500">
          {isPickup ? t("pickupSuccessDesc") : t("successDesc")}
        </p>

      </div>

      {/* Pickup Note */}
{isPickup && (
  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-xl text-center">

    <p className="font-semibold">
      {t("pickupNote")}
    </p>

    <p className="mt-2 text-sm">
      {t("pickupBranch")}:{" "}
      {locale === "ar"
        ? branch?.name_ar || order.pickup_branch
        : order.pickup_branch}
    </p>

    {/* 🔥 Google Maps Button */}
    {branch?.map && (
      <a
        href={branch.map}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 border border-blue-600 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
      >
        {t("openLocation")}
      </a>
    )}

    {/* 🔥 WhatsApp Button */}
    {whatsappLink && (
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3 bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-600 transition"
      >
        {t("whatsappBranch")}
      </a>
    )}

  </div>
)}
      

      {/* Order Info */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">

        <div className="flex justify-between mb-4">
          <span className="font-semibold">{t("orderId")}</span>
          <span>{order.id}</span>
        </div>

        <div className="flex justify-between mb-4">
          <span className="font-semibold">{t("paymentStatus")}</span>
          <span className="text-green-600 font-semibold">
            {order.payment_status}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">{t("orderStatus")}</span>
          <span>{order.status}</span>
        </div>

      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">

        <h2 className="font-bold mb-4 text-lg">
          {t("items")}
        </h2>

        <div className="space-y-3">

          {order.order_items?.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between border-b pb-2"
            >
              <span>
                {locale === "ar"
                  ? item.product?.name_ar || item.product?.name_en
                  : item.product?.name_en}
              </span>

              <span>
                x{item.quantity} — SAR {item.price}
              </span>
            </div>
          ))}

        </div>

      </div>

      {/* Total */}
      <div className="bg-white p-6 rounded-xl border shadow-sm text-right">

        <span className="text-lg font-bold">
          {t("total")}: SAR {order.total}
        </span>

      </div>

    </div>
  )
}