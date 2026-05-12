export const dynamic = "force-dynamic";

import { getCategories } from '@/app/actions/products';
import { Link } from '@/i18n/routing';
import { Factory } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {

  // ✅ الحل النهائي
  const { locale } = await params;

  const categories = await getCategories();

  const t = await getTranslations("Categories");

  const isArabic = locale === "ar";

  const getName = (cat: any) =>
    isArabic ? cat.name_ar || cat.name_en : cat.name_en;

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

      {/* Categories Grid */}
      <section className="py-12">

        <div className="max-w-7xl mx-auto px-4">

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

            {categories.map((cat: any) => (

              <Link
                key={cat.id}
                href={{
                  pathname: "/products",
                  query: { category: cat.id }
                }}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition duration-300 hover:-translate-y-1"
              >

                <div className="h-28 flex items-center justify-center mb-4">

                  {cat.image ? (
                    <img
                      src={cat.image}
                      className="h-full object-contain group-hover:scale-105 transition"
                    />
                  ) : (
                    <Factory className="w-10 h-10 text-blue-600" />
                  )}

                </div>

                <h3 className="
  text-sm sm:text-base
  font-medium
  tracking-wide
  leading-relaxed
  text-gray-800
  text-center
">
                  {getName(cat)}
                </h3>

                <p className="text-xs text-gray-500 text-center mt-1">
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