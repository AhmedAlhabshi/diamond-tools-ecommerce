import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { logout } from "@/app/actions/auth"
import { Building2, Mail, Phone, MapPin, FileText } from "lucide-react"
import { getTranslations } from 'next-intl/server'
import QuoteButton from "@/components/QuoteButton"

export default async function DashboardPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ passwordChanged?: string }>
}) {

  const { locale } = await params
  const { passwordChanged } = await searchParams

  const t = await getTranslations("Dashboard")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect(`/${locale}/login`)
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="bg-slate-50 min-h-screen py-10">

      <div className="max-w-7xl mx-auto px-4">

        {/* Success */}
        {passwordChanged && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-6">
            {t("passwordChanged")}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">

          <h1 className="text-3xl font-bold">
            {t("title")}
          </h1>

          <form action={logout}>
            <input type="hidden" name="locale" value={locale} />
            <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold border hover:bg-red-100 transition">
              {t("signOut")}
            </button>
          </form>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Account */}
          <div className="bg-white p-6 rounded-xl shadow md:col-span-2">

            <h2 className="text-xl font-bold mb-4">
              {t("accountInfo")}
            </h2>

            <div className="space-y-3">

              <div className="flex items-center gap-2">
                <Building2 size={18} />
                {profile.name}
              </div>

              <div className="flex items-center gap-2">
                <Mail size={18} />
                {profile.email || user.email}
              </div>

              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={18} />
                  {profile.phone}
                </div>
              )}

              {profile.city && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  {profile.city}
                </div>
              )}

            </div>

            <div className="flex gap-3 mt-6">

              <Link
                href="/account/edit"
                locale={locale}
                className="bg-brand-blue text-white px-4 py-2 rounded-lg font-semibold"
              >
                {t("editProfile")}
              </Link>

              <Link
                href="/account/change-password"
                locale={locale}
                className="border px-4 py-2 rounded-lg font-semibold"
              >
                {t("changePassword")}
              </Link>

            </div>

          </div>

          {/* Orders */}
          <div className="bg-white p-6 rounded-xl shadow">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl font-bold">
                {t("orders")}
              </h2>

              <Link
                href="/orders"
                locale={locale}
                className="text-brand-blue text-sm font-semibold hover:underline"
              >
                {t("viewAll")}
              </Link>

            </div>

            <div className="text-3xl font-bold mb-1">
              {orders?.length || 0}
            </div>

            <p className="text-gray-500 mb-4">
              {t("totalOrders")}
            </p>

            {orders?.slice(0,3).map((order) => (
              <div 
                key={order.id}
                className="border rounded-lg p-3 mb-2 flex justify-between items-center"
              >

                <div>
                  <div className="font-semibold text-sm">
                    {t("order")} #{order.id.slice(0,8)}
                  </div>

                  <div className="text-xs text-gray-500">
                    SAR {order.total}
                  </div>
                </div>

                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {t(`status.${order.status}`)}
                </span>

              </div>
            ))}

          </div>

        </div>

        {/* 🔥 NEW Quote Section */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">

          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <FileText size={20} />
            {t("quoteRequests")}
          </h2>

          <p className="text-gray-500 mb-4">
            {t("quoteInfo")}
          </p>

<QuoteButton label={t("requestQuote")} />

        </div>

      </div>

    </div>
  )
}