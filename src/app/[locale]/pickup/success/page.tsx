'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getOrderWithItems } from '@/app/actions/payment'
import { useTranslations, useLocale } from 'next-intl'
import { branches } from '@/lib/branches'

export default function PickupSuccess() {

  const t = useTranslations("PickupSuccess")
  const locale = useLocale()

  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [order, setOrder] = useState<any>(null)

  useEffect(() => {

    const load = async () => {

      if (!orderId) return

      const data = await getOrderWithItems(orderId)

      if (data) {
        setOrder(data)
      }

    }

    load()

  }, [])

  if (!order) {
    return (
      <div className="text-center py-20">
        {t("loading")}
      </div>
    )
  }

  // 🔥 get branch data
const branch = branches.find(
  (b) =>
    b.name_en === order.pickup_branch ||
    b.name_ar === order.pickup_branch
)
  const whatsappLink = branch
    ? `https://wa.me/${branch.phone.replace(/\s+/g, '')}`
    : null

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-8">

      {/* Header */}
      <div className="text-center">

        <h1 className="text-3xl font-bold text-green-600 mb-2">
          {t("successTitle")}
        </h1>

        <p className="text-gray-500">
          {t("successDesc")}
        </p>

      </div>

      {/* Note */}
<div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-xl text-center">

  <p className="font-semibold">
    {t("pickupNote")}
  </p>

  <p className="mt-2 text-sm">
    {t("branch")}:{" "}
    {locale === "ar"
      ? branch?.name_ar || order.pickup_branch
      : order.pickup_branch}
  </p>

  <div className="mt-4 flex flex-wrap justify-center gap-3">

    {branch?.map && (
      <a
        href={branch.map}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block border border-blue-600 text-blue-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-100 transition"
      >
        {t("openLocation")}
      </a>
    )}

    {whatsappLink && (
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-600 transition"
      >
        {t("whatsappBranch")}
      </a>
    )}

  </div>

</div>

      {/* Order Info */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">

        <div className="flex justify-between mb-4">
          <span className="font-semibold">{t("orderId")}</span>
          <span dir="ltr" className="inline-block">{order.id}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">{t("status")}</span>
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
                <span className="block text-xs text-slate-500">
                  {item.product_code || item.product?.product_code || '-'}
                  {item.variant_code ? ` / ${item.variant_code}` : ''}
                </span>
              </span>

              <span dir="ltr" className="inline-block">
                x{item.quantity} — SAR {Number(item.price || 0).toFixed(2)}
              </span>
            </div>
          ))}

        </div>

      </div>

      {/* Total */}
      <div className="bg-white p-6 rounded-xl border shadow-sm text-right">

        <span className="text-lg font-bold">
          {t("total")}:{" "}
          <span dir="ltr" className="inline-block">
            SAR {Number(order.total || 0).toFixed(2)}
          </span>
        </span>

      </div>

    </div>
  )
}
