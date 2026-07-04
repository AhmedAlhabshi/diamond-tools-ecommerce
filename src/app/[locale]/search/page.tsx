import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;

  const searchQuery = q?.trim() || "";
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name_en,
      name_ar,
      images,
      individual_price,
      made_in,
      product_code,
      categories (
        name_en,
        name_ar
      ),
      brands (
        name_en,
        name_ar,
        image
      )
    `)
    .eq("is_active", true)
    .or(
      `name_en.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%,product_code.ilike.%${searchQuery}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {locale === "ar" ? "نتائج البحث" : "Search Results"}
        </h1>

        <form
          action={`/${locale}/search`}
          className="mb-8 flex gap-3"
        >
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder={locale === "ar" ? "ابحث عن منتج..." : "Search products..."}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {locale === "ar" ? "بحث" : "Search"}
          </button>
        </form>

        <p className="mb-6 text-sm text-gray-600">
          {locale === "ar"
            ? `${products?.length || 0} منتج`
            : `${products?.length || 0} products found`}
        </p>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const name = locale === "ar" ? product.name_ar : product.name_en;
              const image = product.images?.[0];

              return (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.id}`}
                  className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                    {image && (
                      <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>

                  <h2 className="line-clamp-2 text-sm font-semibold text-gray-900">
                    {name}
                  </h2>

                  {product.made_in && (
                    <p className="mt-1 text-xs text-gray-500">
                      {locale === "ar" ? "الصنع:" : "Made in:"} {product.made_in}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-10 text-center text-gray-500">
            {locale === "ar"
              ? "لا توجد منتجات مطابقة للبحث."
              : "No products found for this search."}
          </div>
        )}
      </div>
    </main>
  );
}