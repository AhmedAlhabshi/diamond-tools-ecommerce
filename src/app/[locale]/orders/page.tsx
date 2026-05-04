import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { setRequestLocale } from 'next-intl/server'

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {

  const { locale } = await params

  setRequestLocale(locale) // ✅ THIS FIXES YOUR ISSUE

  const t = await getTranslations("Orders")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (

    <div className="max-w-7xl mx-auto px-4 py-12">

      <h1 className="text-3xl font-bold mb-8">
        {t("title")}
      </h1>

      {orders?.length === 0 && (
        <p>{t("empty")}</p>
      )}

      <div className="space-y-4">

        {orders?.map((order) => (

          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            locale={locale}
            className="block border p-6 rounded-lg hover:shadow-md transition"
          >

            <div className="flex justify-between mb-2">

              <span className="font-semibold">
                {t("order")} #{order.id.slice(0,8)}
              </span>

              {/* ✅ FIXED STATUS */}
              <span className={`
                px-3 py-1 rounded text-xs
                ${order.status === "pending_approval" && "bg-yellow-100 text-yellow-700"}
                ${order.status === "completed" && "bg-green-100 text-green-700"}
                ${order.status === "cancelled" && "bg-red-100 text-red-700"}
              `}>
                {t(`status.${order.status}`)}
              </span>

            </div>

            <div className="text-gray-600 text-sm space-y-1">

              <p>
                {t("paymentLabel")}: {t(`payment.${order.payment_method}`)}
              </p>

              <p>
                {t("total")}: SAR {order.total}
              </p>

              <p>
                {t("date")}: {new Date(order.created_at).toLocaleDateString(locale)}
              </p>

            </div>

          </Link>

        ))}

      </div>

    </div>

  )
}