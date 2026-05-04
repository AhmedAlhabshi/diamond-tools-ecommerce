import { createClient } from '@/utils/supabase/server'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import CheckoutForm from '@/components/CheckoutForm'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {

  const { locale } = await params

  // ✅ VERY IMPORTANT
  setRequestLocale(locale)

  const t = await getTranslations("Checkout")

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  let profile = null

  // If logged in → get profile
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = data
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      <h1 className="text-3xl font-extrabold tracking-tight">
        {t("title")}
      </h1>

      <CheckoutForm profile={profile} />

    </div>
  )
}