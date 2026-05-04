"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

const images = [
  "/hero/1.jpg",
  "/hero/2.jpg",
  "/hero/3.jpg"
];

export default function HeroSection() {

  const [index, setIndex] = useState(0);

  const locale = useLocale();
  const t = useTranslations("Hero");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (

    <section className="relative w-full overflow-hidden">

      {/* Background */}
      <div
        className="
          h-[320px] sm:h-[420px] md:h-[500px]
          bg-cover bg-center transition-all duration-1000
        "
        style={{ backgroundImage: `url(${images[index]})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center pointer-events-none">

        <div className="w-full px-4 sm:px-6 lg:px-16 text-white pointer-events-auto">

          <div
            className={`max-w-2xl space-y-3 sm:space-y-5 ${
              locale === "ar"
                ? "text-center sm:text-right ml-auto"
                : "text-center sm:text-left"
            }`}
          >

            <span className="bg-blue-600 px-3 py-1 rounded-full text-xs sm:text-sm inline-block">
              {t("since")}
            </span>

<h1
  className="
    text-2xl sm:text-4xl md:text-6xl
    leading-tight font-bold
    whitespace-nowrap
  "
  style={{ letterSpacing: "4px" }}
>
  {t("title")}
</h1>
            <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-line">
              {t("description")}
            </p>

            {/* Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center ${
                locale === "ar"
                  ? "sm:justify-end sm:flex-row-reverse"
                  : "sm:justify-start"
              }`}
            >

              <Link
                href="/products"
                className="bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition"
              >
                {t("browse")}
              </Link>

              <Link
                href="/contact"
                className="bg-white text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition"
              >
                {t("contact")}
              </Link>

            </div>

            {/* Features */}
            <div
              className={`flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm pt-2 text-gray-300 ${
                locale === "ar"
                  ? "justify-center sm:justify-end"
                  : "justify-center sm:justify-start"
              }`}
            >

              <span>✔ {t("feature1")}</span>
              <span>✔ {t("feature2")}</span>
              <span>✔ {t("feature3")}</span>

            </div>

          </div>

        </div>

      </div>

      {/* Slider Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">

        {images.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 sm:w-8 bg-white" : "w-2 bg-white/50"
            }`}
          />
        ))}

      </div>

    </section>
  );
}