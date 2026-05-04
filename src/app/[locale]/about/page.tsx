import { getTranslations, setRequestLocale } from 'next-intl/server'
import OurSuppliers from "@/components/OurSuppliers";
import OurClients from "@/components/OurClients";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {

  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('About') // ✅ FIXED namespace

  return (
    <div className="bg-white">

      {/* HERO SECTION */}
      <section className="relative">

        {/* Mobile Image */}
        <img
          src="/mobile-about.jpg"
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        />

        {/* Desktop Image */}
        <img
          src="/about.jpg"
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
        />

        {/* CONTENT */}
        <div className="relative py-10 md:py-16">

          <div className="max-w-7xl px-4">

            <div className="max-w-full md:max-w-2xl space-y-5 text-black">

              <h2 className="text-xl md:text-3xl font-bold">
                {t("title")}
              </h2>

              <p
                className="text-sm md:text-base leading-7 md:leading-relaxed text-left md:text-justify"
                style={{ textAlign: 'justify', textJustify: 'inter-word' }}
              >
                {t("p1")}
              </p>

              <p
                className="text-sm md:text-base leading-7 md:leading-relaxed whitespace-pre-line"
                style={{ textAlign: 'justify', textJustify: 'inter-word' }}
              >
                {t("p2")}
              </p>

              <p
                className="text-sm md:text-base leading-7 md:leading-relaxed text-left md:text-justify"
                style={{ textAlign: 'justify', textJustify: 'inter-word' }}
              >
                {t("p3")}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Our Suppliers */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <OurSuppliers />
        </div>
      </section>

      {/* Our Clients */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <OurClients />
        </div>
      </section>

    </div>
  )
}