import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {

  const { id, locale } = await params

  // ✅ IMPORTANT
  setRequestLocale(locale)

  const t = await getTranslations("OrderDetails")

  const translateOrderValue = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  // Items
  const { data: items } = await supabase
    .from('order_items')
    .select(`
      *,
      products (*)
    `)
    .eq('order_id', order.id)

  return (

    <div className="max-w-7xl mx-auto px-4 py-12">

      <h1 className="text-3xl font-bold mb-8">
        {t("order")} #{order.id.slice(0, 8).toUpperCase()}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ITEMS */}
        <div className="lg:col-span-2">

          <div className="border rounded-lg p-6">

            <h2 className="text-xl font-semibold mb-4">
              {t("items")}
            </h2>

            <div className="space-y-4">

              {items?.map((item: any) => (

                <div
                  key={item.id}
                  className="flex justify-between border-b pb-3"
                >

                  <div>
                    <p className="font-semibold">
                      {locale === "ar"
                        ? item.products.name_ar
                        : item.products.name_en}
                    </p>

                    <p className="text-sm text-gray-500">
                      {t("qty")}: {item.quantity}
                    </p>
                  </div>

                  <div className="font-bold">
                    SAR {item.price}
                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div>

          {/* ORDER INFO */}
          <div className="border rounded-lg p-6 mb-6">

            <h2 className="text-xl font-semibold mb-4">
              {t("info")}
            </h2>

            <p>
              {t("status")}: {translateOrderValue(
                `statusLabel.${order.status}`,
                order.status
              )}
            </p>

            <p>
              {t("paymentLabel")}: {translateOrderValue(
                `payment.${order.payment_method}`,
                order.payment_method || '-'
              )}
            </p>

            <p>
              {t("total")}: SAR {Number(order.total || 0).toFixed(2)}
            </p>

          </div>

          {/* ADDRESS */}
          <div className="border rounded-lg p-6">

            <h2 className="text-xl font-semibold mb-4">
              {t("address")}
            </h2>

            <p>{order.city}</p>
            <p>{order.district}</p>
            <p>{order.street}</p>

            <p>
              {t("building")}: {order.building}
            </p>

            <p>
              {t("shortAddress")}: {order.short_address || '-'}
            </p>

            <p>
              {t("phone")}: {order.phone}
            </p>

            {order.delivery_notes && (
              <p className="text-gray-500 mt-2">
                {order.delivery_notes}
              </p>
            )}

          </div>

        </div>

      </div>

    </div>

  )
}
