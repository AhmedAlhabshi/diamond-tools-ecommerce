import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {

  const { locale } = await params

  setRequestLocale(locale)

  const t = await getTranslations("VerifyEmail")

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">

        <h1 className="text-2xl font-bold mb-4">
          {t("title")}
        </h1>

        <p className="text-gray-500 mb-6">
          {t("message")}
        </p>

        <div className="text-sm text-gray-400">
          {t("note")}
        </div>

      </div>

    </div>
  )
}