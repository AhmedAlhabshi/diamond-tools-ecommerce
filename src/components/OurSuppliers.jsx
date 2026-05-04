"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

const brands = [
  "/brands/Tyrolit1.jpg",
  "/brands/Sundisc1.jpg",
  "/brands/starke1.jpg",
  "/brands/Saint-Gobain1.jpg",
  "/brands/Mirka1.jpg",
  "/brands/GrindoJet1.jpg",
  "/brands/Garryson1.jpg",
  "/brands/Flexovit1.jpg",
  "/brands/Diewe1.jpg",
];

export default function OurSuppliers() {
  const locale = useLocale();
  const t = useTranslations("Suppliers");

  const isRTL = locale === "ar";

  return (
    <section className="py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            {t("title")}
          </h2>
        </div>

        {/* 🔥 Desktop Slider */}
        <div className="relative w-full overflow-hidden hidden md:block">
          <div
            className="flex gap-12 items-center will-change-transform"
            style={{
              animation: isRTL
                ? "scroll-rtl 20s linear infinite"
                : "scroll-ltr 20s linear infinite"
            }}
          >
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="min-w-[150px] opacity-70 hover:opacity-100 transition hover:scale-110"
              >
                <Image
                  src={brand}
                  alt="brand"
                  width={150}
                  height={80}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 📱 Mobile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:hidden gap-5">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-center border border-gray-100"
            >
              <Image
                src={brand}
                alt="brand"
                width={110}
                height={60}
                className="object-contain opacity-80"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}