import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function OrderPendingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {

  const { locale } = await params

  setRequestLocale(locale)

  const t = await getTranslations("OrderPending")

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">

      <div className="bg-white p-8 rounded-2xl shadow-md border text-center max-w-md w-full">

        <h1 className="text-2xl font-extrabold text-yellow-600 mb-4">
          {t("title")}
        </h1>

        <p className="text-slate-600 mb-4">
          {t("message1")}
        </p>

        <p className="text-slate-500 text-sm mb-6">
          {t("message2")}
        </p>

        <a
          href={`/${locale}`}
          className="inline-block bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition"
        >
          {t("button")}
        </a>

      </div>

    </div>
  )
}