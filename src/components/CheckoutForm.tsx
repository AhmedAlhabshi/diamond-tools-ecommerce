'use client'

import { useCart } from '@/store/useCart'
import { processCheckout } from '@/app/actions/checkout'
import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Database } from '@/types/supabase'
import { getDeliveryFee } from '@/lib/delivery'
import ProductPrice from './product-price'
import { branches } from '@/lib/branches'

type Profile = Database['public']['Tables']['users']['Row'] | null

export default function CheckoutForm({ profile }: { profile: Profile }) {

  const t = useTranslations("CheckoutForm")
  const locale = useLocale()

  const { items, getTotal, clearCart } = useCart()

  const [mounted, setMounted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Visa')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [selectedBranch, setSelectedBranch] = useState('')

  useEffect(() => {
    setMounted(true)

    const params = new URLSearchParams(window.location.search)
    const method = params.get('method')

    if (method === 'pickup') {
      setFulfillmentMethod('pickup')
      setPaymentMethod('Pay on Pickup')
    }
  }, [])

useEffect(() => {
  if (fulfillmentMethod === 'delivery' && paymentMethod === 'Pay on Pickup') {
    setPaymentMethod('Visa')
  }

  if (fulfillmentMethod === 'delivery') {
    setSelectedBranch('')
  }
}, [fulfillmentMethod, paymentMethod])

  const subtotal = getTotal()

  const deliveryFee =
    fulfillmentMethod === 'pickup' ? 0 : getDeliveryFee(subtotal)

  const vat = (subtotal + deliveryFee) * 0.15
  const totalWithVat = subtotal + deliveryFee + vat

  const paymentOptions =
    fulfillmentMethod === 'pickup'
      ? ['Visa', 'MasterCard', 'Mada', 'Bank Transfer', 'Pay on Pickup']
      : ['Visa', 'MasterCard', 'Mada', 'Bank Transfer']

  const logos: any = {
    Visa: "/payment/visa.png",
    MasterCard: "/payment/mastercard.png",
    Mada: "/payment/mada.png",
    "Bank Transfer": "/payment/bank-transfer.png",
  }

  async function handleSubmit(formData: FormData) {

    if (items.length === 0) return

    setError(null)

    formData.append("fulfillment_method", fulfillmentMethod)

    if (fulfillmentMethod === "pickup") {
      if (!selectedBranch) {
        setError(t("errors.branch"))
        return
      }

      formData.append("pickup_branch", selectedBranch)
    }

    if (paymentMethod === "Bank Transfer") {
      const file = formData.get("bank_slip") as File

      if (!file || file.size === 0) {
        setError(t("errors.upload"))
        return
      }
    }

    setLoading(true)

    const res = await processCheckout(items, formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
      return
    }

    clearCart()

if (fulfillmentMethod === "pickup" && paymentMethod === "Pay on Pickup") {
  window.location.href = `/${locale}/pickup/success?order_id=${res.orderId}`
  return
}

    if (paymentMethod === "Bank Transfer") {
      window.location.href = `/${locale}/payment/pending`
    } else {
      window.location.href = `/${locale}/payment?amount=${totalWithVat}&order_id=${res.orderId}`
    }
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        {t("loading")}
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 mt-8">

      {/* FORM */}
      <div className="flex-1">

        <form
          id="checkout-form"
          action={handleSubmit}
          className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200"
        >

          {error && (
            <div className="text-red-500 bg-red-50 p-4 rounded-md">
              {error}
            </div>
          )}

          {/* Delivery Method */}
          <div>
            <h2 className="text-xl font-bold border-b pb-2 mb-6">
              {t("deliveryMethod")}
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <button
                type="button"
                onClick={() => setFulfillmentMethod("delivery")}
                className={`border rounded-xl p-4 font-semibold transition ${
                  fulfillmentMethod === "delivery"
                    ? "border-brand-blue bg-blue-50 text-brand-blue"
                    : "border-slate-300 text-slate-700"
                }`}
              >
                🚚 {t("delivery")}
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentMethod("pickup")}
                className={`border rounded-xl p-4 font-semibold transition ${
                  fulfillmentMethod === "pickup"
                    ? "border-brand-blue bg-blue-50 text-brand-blue"
                    : "border-slate-300 text-slate-700"
                }`}
              >
                🏬 {t("pickup")}
              </button>

            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-xl font-bold border-b pb-2 mb-6">
              {t("customer")}
            </h2>

            <div className="space-y-4">
              <input name="name" placeholder={t("name")} defaultValue={profile?.name || ""} required className="form-input w-full rounded-md border py-2 px-3" />
              <input name="email" type="email" placeholder={t("email")} defaultValue={profile?.email || ""} required className="form-input w-full rounded-md border py-2 px-3" />
              <input name="phone" placeholder={t("phone")} defaultValue={profile?.phone || ""} required className="form-input w-full rounded-md border py-2 px-3" />
            </div>
          </div>

          {/* Address - Delivery Only */}
          {fulfillmentMethod === "delivery" && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-6">
                {t("address")}
              </h2>

              <div className="space-y-4">
                <input name="city" placeholder={t("city")} required className="form-input w-full rounded-md border py-2 px-3" />
                <input name="district" placeholder={t("district")} required className="form-input w-full rounded-md border py-2 px-3" />
                <input name="street" placeholder={t("street")} required className="form-input w-full rounded-md border py-2 px-3" />
                <input name="building" placeholder={t("building")} required className="form-input w-full rounded-md border py-2 px-3" />
                <textarea name="delivery_notes" placeholder={t("notes")} className="form-input w-full rounded-md border py-2 px-3" />
              </div>
            </div>
          )}

          {/* Pickup Branch */}
          {fulfillmentMethod === "pickup" && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-6">
                {t("selectBranch")}
              </h2>

              <div className="grid gap-3">
{branches.map((branch) => (
  <button
    key={branch.id}
    type="button"
    onClick={() => setSelectedBranch(branch.name_en)} // نحفظ الإنجليزي
    className={`border rounded-xl p-4 text-start transition ${
      selectedBranch === branch.name_en
        ? "border-brand-blue bg-blue-50"
        : "border-slate-300"
    }`}
  >

    {/* اسم الفرع */}
    <p className="font-bold text-brand-blue">
      {locale === "ar" ? branch.name_ar : branch.name_en}
    </p>

    {/* رقم الجوال */}
    <p className="text-sm text-slate-600 mt-1">
      <bdi dir="ltr" className="inline-block">
        {branch.phone}
      </bdi>
    </p>

    {/* الموقع */}
    <a
      href={branch.map}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-block mt-2 text-sm text-blue-700 font-semibold hover:underline"
    >
      {t("branchLocation")}
    </a>

  </button>
))}
              </div>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                {t("pickupNote")}
              </div>
            </div>
          )}

          {/* Payment */}
          <div>
            <h2 className="text-xl font-bold border-b pb-2 mb-6">
              {t("payment")}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {paymentOptions.map((method) => (
                <label
                  key={method}
                  className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${
                    paymentMethod === method
                      ? 'border-brand-blue bg-blue-50'
                      : 'border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />

                  {method === "Pay on Pickup" ? (
                    <span className="text-xl">💵</span>
                  ) : (
                    <img src={logos[method]} className="h-6" />
                  )}

                  {method === "Pay on Pickup"
                    ? t("methods.Pay on Pickup")
                    : t(`methods.${method}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Bank Transfer */}
          {paymentMethod === 'Bank Transfer' && (
            <div className="bg-slate-50 p-6 rounded-xl border-2 border-dashed">
              <h3 className="font-bold mb-2">{t("bankTitle")}</h3>

              <p className="text-sm text-slate-600 mb-4 whitespace-pre-line">
                {t("bankInfo")}
              </p>

              <input type="file" name="bank_slip" accept="image/*,.pdf" required />
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="block w-full text-center bg-brand-blue text-blue py-4 rounded-lg font-extrabold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
{loading
  ? t("processing")
  : paymentMethod === "Pay on Pickup"
  ? t("confirmOrder")
  : paymentMethod === "Bank Transfer"
  ? t("placeOrder")
  : t("pay", { amount: totalWithVat.toFixed(2) })
}
          </button>

        </form>

      </div>

      {/* ORDER SUMMARY */}
      <div className="w-full lg:w-96 shrink-0">

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 sticky top-24">

          <h2 className="text-xl font-bold mb-6">{t("summary")}</h2>

          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">

            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">

                <div className="w-14 h-14 bg-white border rounded-md flex items-center justify-center">
                  {item.image && (
                    <img src={item.image} className="object-contain w-full h-full p-1" />
                  )}
                </div>

                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {t("qty")}: {item.quantity}
                  </p>
                </div>

                <ProductPrice price={item.price * item.quantity} size="sm" />

              </div>
            ))}

          </div>

          <div className="space-y-3 text-sm border-t pt-4">

            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <ProductPrice price={subtotal} size="sm" />
            </div>

            <div className="flex justify-between">
              <span>{t("delivery")}</span>
              <ProductPrice price={deliveryFee} size="sm" />
            </div>

            <div className="flex justify-between">
              <span>{t("vat")}</span>
              <ProductPrice price={vat} size="sm" />
            </div>

            <div className="flex justify-between font-bold text-lg pt-2">
              <span>{t("total")}</span>
              <ProductPrice price={totalWithVat} />
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}