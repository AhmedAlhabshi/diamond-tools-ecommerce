'use client'

import { useCart } from '@/store/useCart'
import { useLocale, useTranslations } from 'next-intl'
import { Minus, Plus, Trash2, PackageSearch } from 'lucide-react'
import { Link } from '@/i18n/routing'
import ProductPrice from '@/components/product-price'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getDeliveryFee } from '@/lib/delivery'

export default function CartPage() {

  const t = useTranslations("Cart")
  const locale = useLocale()

  const { items, removeItem, updateQuantity, getTotal } = useCart()

  const [user, setUser] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)

  // ✅ NEW: fulfillment method
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const subtotal = getTotal()

  // ✅ UPDATED: delivery fee depends on method
  const deliveryFee = method === 'pickup' ? 0 : getDeliveryFee(subtotal)

  const remainingForFree = 200 - subtotal
  const vat = (subtotal + deliveryFee) * 0.15
  const totalWithVat = subtotal + deliveryFee + vat

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <PackageSearch className="mx-auto h-24 w-24 text-slate-300 mb-6" />

        <h2 className="text-3xl font-extrabold mb-4">
          {t("emptyTitle")}
        </h2>

        <p className="text-slate-600 mb-8">
          {t("emptyDesc")}
        </p>

        <Link href="/products" className="bg-brand-blue text-white px-8 py-3 rounded-md">
          {t("startShopping")}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      <h1 className="text-3xl font-bold mb-8">
        {t("title")}
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">

        {/* ITEMS */}
        <div className="flex-1 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-6 border-b pb-6">

              <Link href={`/products/${item.product_id}`}>
                <div className="w-24 h-24 bg-slate-100 rounded-md flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} className="object-contain w-full h-full p-2" />
                  ) : (
                    <PackageSearch className="w-8 h-8 text-slate-300" />
                  )}
                </div>
              </Link>

              <div className="flex-1 flex flex-col">

                <div className="flex justify-between">
<Link href={`/products/${item.product_id}`}>
  <h3 className="font-semibold hover:text-brand-blue">
    {item.name}
  </h3>
</Link>

{/* Variant details */}
{item.variant_id !== "default" && (
  <div className="mt-1 text-xs text-slate-500 space-y-0.5">

    {item.material_name_en && (
      <p>
        Material:{" "}
        {locale === "ar"
          ? item.material_name_ar || item.material_name_en
          : item.material_name_en}
      </p>
    )}

    {item.diameter && <p>Diameter: {item.diameter}</p>}
    {item.thickness && <p>Thickness: {item.thickness}</p>}
    {item.hole_size && <p>Hole Size: {item.hole_size}</p>}
    {item.grit && <p>Grit: {item.grit}</p>}
    {item.length && <p>Length: {item.length}</p>}
    {item.machine && <p>Machine: {item.machine}</p>}

  </div>
)}

                  <ProductPrice price={item.price} />
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="px-4">{item.quantity}</span>

                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 text-sm"
                  >
                    {t("remove")}
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="w-full lg:w-96">

          <div className="bg-slate-50 p-6 rounded-xl">

            <h2 className="text-xl font-bold mb-6">
              {t("summary")}
            </h2>

            {/* ✅ NEW: DELIVERY METHOD SELECTOR */}
            <div className="mb-6 space-y-3">
              <p className="text-sm font-semibold">{t("deliveryMethod")}</p>

              <div className="grid grid-cols-2 gap-3">

                <button
                  onClick={() => setMethod('delivery')}
                  className={`border rounded-lg py-2 text-sm ${
                    method === 'delivery'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  🚚 {t("delivery")}
                </button>

                <button
                  onClick={() => setMethod('pickup')}
                  className={`border rounded-lg py-2 text-sm ${
                    method === 'pickup'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  🏬 {t("pickup")}
                </button>

              </div>
            </div>

            <div className="space-y-4 mb-6">

              <div className="flex justify-between">
                <span>{t("subtotal")}</span>
                <ProductPrice price={subtotal} />
              </div>

              <div>
                <div className="flex justify-between">
                  <span>{t("delivery")}</span>
                  <ProductPrice price={deliveryFee} />
                </div>

                {/* show warning ONLY for delivery */}
                {method === 'delivery' && subtotal < 200 && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>
                      {t("deliveryWarning", {
                        amount: remainingForFree.toFixed(0),
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <span>{t("vat")}</span>
                <ProductPrice price={vat} />
              </div>

            </div>

            <div className="flex justify-between font-bold mb-6">
              <span>{t("total")}</span>
              <ProductPrice price={totalWithVat} />
            </div>

            <button
              onClick={() => {
                if (user) {
                  window.location.href = `/${locale}/checkout?method=${method}`
                } else {
                  setShowAuth(true)
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              {t("checkout")}
            </button>

          </div>

        </div>

      </div>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">

            <h2 className="text-xl font-bold text-center mb-2">
              {t("authTitle")}
            </h2>

            <p className="text-sm text-center mb-6">
              {t("authDesc")}
            </p>

            <div className="flex flex-col gap-3">

              <Link href="/login" className="border py-2 text-center rounded">
                {t("login")}
              </Link>

              <button
                onClick={() => window.location.href = `/${locale}/checkout?guest=true`}
                className="border py-2 rounded"
              >
                {t("guest")}
              </button>

            </div>

            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 text-sm text-gray-500 w-full"
            >
              {t("cancel")}
            </button>

          </div>

        </div>
      )}

    </div>
  )
}