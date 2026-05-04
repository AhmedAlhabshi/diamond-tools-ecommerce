'use client'

import { useLocale, useTranslations } from 'next-intl'

export default function Branches() {

  const t = useTranslations("Branches")
  const locale = useLocale()

  const branches = [
    {
      name_en: "Alnakheel - Jeddah",
      name_ar: "النخيل - جدة",
      phone: "+966 54 601 0202",
      image: "/locations/jeddah.jpg",
      map: "https://maps.app.goo.gl/eNMKumfPLotSCBQ98",
      hours_en: ["Sat - Thu: 8 AM to 5 PM"],
      hours_ar: ["السبت - الخميس: 8 صباحًا إلى 5 مساءً"]
    },
    {
      name_en: "Albaladiya - Jeddah",
      name_ar: "البلدية - جدة",
      phone: "+966 54 644 6886",
      image: "/locations/jeddah2.jpg",
      map: "https://maps.app.goo.gl/Fd4vN4xx1UJ2nCY28",
      hours_en: ["Sat - Thu:", "8 AM to 1:30 PM", "4 PM to 8 PM"],
      hours_ar: ["السبت - الخميس:", "8 صباحًا إلى 1:30 مساءً", "4 مساءً إلى 8 مساءً"]
    },
    {
      name_en: "Ar Rail - Riyadh",
      name_ar: "الريل - الرياض",
      phone: "+966 54 601 0201",
      image: "/locations/riyadh.jpg",
      map: "https://maps.app.goo.gl/2rVwQ5mEcqTz5oHFA",
      hours_en: ["Sat - Thu:", "8 AM to 5 PM"],
      hours_ar: ["السبت - الخميس:", "8 صباحًا إلى 5 مساءً"]
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">

      {branches.map((branch, index) => {
        const hours = locale === "ar" ? branch.hours_ar : branch.hours_en

        return (
          <div
            key={index}
            className="border rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col h-full"
          >

            <img
              src={branch.image}
              className="w-full h-52 object-cover"
              alt={locale === "ar" ? branch.name_ar : branch.name_en}
            />

            <div className="p-5 space-y-4 flex flex-col flex-1">

<h3
  className={`font-bold text-brand-blue leading-snug min-h-[48px] flex items-center ${
    locale === "ar" ? "text-4xl" : "text-2xl"
  }`}
>
  {locale === "ar" ? branch.name_ar : branch.name_en}
</h3>
              <p className="text-gray-600 text-sm">
                {t("tel")}:{" "}
                <span dir="ltr" className="inline-block">
                  {branch.phone}
                </span>
              </p>

              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-slate-800">
                  {t("openingHours")}
                </p>

                {hours.map((h, i) => (
                  <p key={i}>
                    {h}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">

                <a
                  href={branch.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center border border-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  {t("location")}
                </a>

                <a
                  href={`https://wa.me/${branch.phone.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-green-500 text-white py-2.5 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  {t("whatsapp")}
                </a>

              </div>

            </div>

          </div>
        )
      })}

    </div>
  )
}