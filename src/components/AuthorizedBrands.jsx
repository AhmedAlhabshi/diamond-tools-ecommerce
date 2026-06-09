"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

const brands = [
  "/brands/Tyrolit1.jpg",
  "/brands/Mirka1.jpg",
  "/brands/Sundisc1.jpg",
  "/brands/starke1.jpg",
  "/brands/KGS.png",
  "/brands/Saint-Gobain1.jpg",
  "/brands/ABRA.png",
  "/brands/GrindoJet1.jpg",
  "/brands/Garryson1.jpg",
  "/brands/flexipad.png",
  "/brands/Achilli.png",
  "/brands/Flexovit1.jpg",
  "/brands/Diewe1.jpg",
];

export default function AuthorizedBrands() {

  const locale = useLocale();
  const t = useTranslations("BrandsHome");

  return (
    <section className="py-6 bg-gray-100 overflow-hidden">
      <div className="w-full">

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            {t("title")}
          </h2>
        </div>

        {/* 🔥 DESKTOP AUTO SCROLL */}
        <div className="hidden md:block relative w-full overflow-hidden">
<div
 className="flex gap-12 items-center will-change-transform w-max"
  style={{
    animation:
      locale === "ar"
        ? "scroll-rtl 15s linear infinite"
        : "scroll-ltr 15s linear infinite"
  }}
>
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="min-w-[150px] opacity-70 hover:opacity-100 transition hover:scale-110"
              >
                <Image
                  src={brand}
                  alt={`brand-${index}`}
                  width={150}
                  height={80}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 MOBILE GRID */}
        <div className="md:hidden grid grid-cols-3 gap-2 justify-items-center">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="w-[80px] h-[50px] flex items-center justify-center"
            >
              <Image
                src={brand}
                alt={`brand-${index}`}
                width={80}
                height={40}
                className="object-contain max-h-full"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}