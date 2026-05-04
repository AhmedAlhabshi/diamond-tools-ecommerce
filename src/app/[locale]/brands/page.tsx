export const dynamic = "force-dynamic";

import { getBrands } from '@/app/actions/products';
import { Link } from '@/i18n/routing';
import { Factory } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { setRequestLocale } from "next-intl/server";


export default async function BrandsPage() {

  const brands = await getBrands();

  const t = await getTranslations("Brands");
  const locale = await getLocale();

  const isArabic = locale === "ar";

  const getName = (brand: any) =>
    isArabic ? brand.name_ar || brand.name : brand.name;

  return (

    <div className="bg-gray-50 min-h-screen">

      {/* Header */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">

          <h1 className="text-3xl font-bold mb-2">
            {t("title")}
          </h1>

          <p className="text-gray-500">
            {t("subtitle")}
          </p>

        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-12">

        <div className="max-w-7xl mx-auto px-4">

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

            {brands.map((brand: any) => (

              <Link
                key={brand.id}
                href={`/products?brand=${brand.id}`}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition duration-300 hover:-translate-y-1"
              >

                <div className="h-28 flex items-center justify-center mb-4">

                  {brand.image ? (
                    <img
                      src={brand.image}
                      className="h-full object-contain group-hover:scale-105 transition"
                    />
                  ) : (
                    <Factory className="w-10 h-10 text-blue-600" />
                  )}

                </div>

                <h3 className="font-semibold text-sm mb-1">
                  {getName(brand)}
                </h3>

                <p className="text-xs text-gray-500">
                  {t("explore")}
                </p>

              </Link>

            ))}

          </div>

        </div>

      </section>

    </div>

  );
}