"use client"

import * as Icons from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

export default function Footer() {

  const locale = useLocale()
  const t = useTranslations("Footer")

  const isRTL = locale === "ar"

  return (
    <footer className="bg-gray-100 text-slate-700 mt-auto">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

{/* GRID */}
<div className={`grid 
  grid-cols-1 sm:grid-cols-2 md:grid-cols-4 
  gap-6 md:gap-8 ${
    isRTL ? "text-right" : "text-left"
  }`}>

  {/* LOGO */}
  <div className="space-y-3 md:space-y-4 text-center sm:text-left">

    {/* LOGO IMAGE */}
    <img
      src="/logo1.png"
      alt="Diamond Tools"
      className="h-10 md:h-12 object-contain mx-auto sm:mx-0"
    />

    {/* LINKEDIN تحت اللوقو */}
    <div className="flex flex-col gap-3 items-center sm:items-start">

      <a
        href="https://www.linkedin.com/company/diamond-industrial-tools-est./"
        target="_blank"
        className="hover:opacity-80 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-slate-500 hover:text-blue-600 transition"
        >
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 
          2.761 2.239 5 5 5h14c2.761 0 5-2.239 
          5-5v-14c0-2.761-2.239-5-5-5zm-11 
          19h-3v-10h3v10zm-1.5-11.268c-.966 
          0-1.75-.79-1.75-1.764s.784-1.764 
          1.75-1.764 1.75.79 
          1.75 1.764-.784 1.764-1.75 
          1.764zm13.5 11.268h-3v-5.604c0-3.368-4-3.113-4 
          0v5.604h-3v-10h3v1.528c1.396-2.586 
          7-2.777 7 2.476v5.996z"/>
        </svg>
      </a>

    </div>

  </div>

          {/* PRODUCTS */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-slate-900">
              {t("products")}
            </h3>

            <ul className="space-y-1 md:space-y-2 text-sm">
              <li><a href="/products" className="hover:text-blue-600">{t("allProducts")}</a></li>
              <li><a href="/categories" className="hover:text-blue-600">{t("categories")}</a></li>
              <li><a href="/brands" className="hover:text-blue-600">{t("brands")}</a></li>
            </ul>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-slate-900">
              {t("links")}
            </h3>

            <ul className="space-y-1 md:space-y-2 text-sm">
              <li><a href="/about" className="hover:text-blue-600">{t("about")}</a></li>
              <li><a href="/contact" className="hover:text-blue-600">{t("contact")}</a></li>
            </ul>
          </div>

          {/* CONTACT */}
<div>
  <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-slate-900">
    {t("contact")}
  </h3>

  <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">

    {/* ADDRESS */}
<li
  className="flex items-start gap-2"
  dir={locale === "ar" ? "rtl" : "ltr"}
>
  <Icons.MapPin className="w-4 h-4 mt-1 text-blue-600 shrink-0" />
  
  <span className="text-right">
    {t("address1")}<br />
    {t("address2")}
  </span>
</li>

    {/* PHONE */}
<li
  className="flex items-center gap-2"
  dir={locale === "ar" ? "rtl" : "ltr"}
>
  <Icons.Phone className="w-4 h-4 text-blue-600 shrink-0" />

  <span className="ltr">
    {t("phone")}
  </span>
</li>
    {/* EMAIL */}
<li
  className="flex items-center gap-2"
  dir={locale === "ar" ? "rtl" : "ltr"}
>
  <Icons.Mail className="w-4 h-4 text-blue-600 shrink-0" />
  <span className="break-all">{t("email")}</span>
</li>
    {/* HOURS */}
<li
  className="flex items-center gap-2"
  dir={locale === "ar" ? "rtl" : "ltr"}
>
  <Icons.Clock className="w-4 h-4 text-blue-600 shrink-0" />
  <span>{t("hours")}</span>
</li>

  </ul>
</div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-300 mt-6 md:mt-8 pt-4 md:pt-6 text-center text-xs md:text-sm text-slate-600">
          {t("copyright")}
        </div>

      </div>

    </footer>
  )
}