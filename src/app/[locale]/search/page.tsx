// src/app/[locale]/search/page.tsx

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ProductPrice from "@/components/product-price";

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
      *,
      categories (
        name_en,
        name_ar
      ),
      brands (
        name_en,
        name_ar,
        image
      ),
      product_variants (
        variant_code,
        code,
        diameter,
        thickness,
        width,
        length,
        hole_size,
        grit,
        machine,
        stand
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Search page error:", error);
  }

  const filteredProducts =
    products?.filter((product) => {
      if (!searchQuery) return true;

      const q = searchQuery.toLowerCase();

      const searchableText = [
        product.name_en,
        product.name_ar,
        product.product_code,
        product.made_in,
        product.categories?.name_en,
        product.categories?.name_ar,
        product.brands?.name_en,
        product.brands?.name_ar,
        ...(product.product_variants || []).flatMap((variant: any) => [
          variant.variant_code,
          variant.code,
          variant.diameter,
          variant.thickness,
          variant.width,
          variant.length,
          variant.hole_size,
          variant.grit,
          variant.machine,
          variant.stand,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(q);
    }) || [];

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {locale === "ar" ? "نتائج البحث" : "Search Results"}
        </h1>

        <form action={`/${locale}/search`} className="mb-8 flex gap-3">
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder={
              locale === "ar" ? "ابحث عن منتج..." : "Search products..."
            }
            className={`w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 ${
              locale === "ar" ? "text-right" : ""
            }`}
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
            ? `${filteredProducts.length} منتج`
            : `${filteredProducts.length} products found`}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product: any) => {
              const name = locale === "ar" ? product.name_ar : product.name_en;
              const image = product.images?.[0] || "/placeholder.png";

              return (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.id}`}
                  className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={image}
                      alt={name || "Product"}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <h2 className="line-clamp-2 text-sm font-semibold text-gray-900">
                    {name}
                  </h2>

                  {product.made_in && (
                    <p className="mt-1 text-xs text-gray-500">
                      {locale === "ar" ? "الصنع:" : "Made in:"}{" "}
                      {product.made_in}
                    </p>
                  )}

                  <div className="mt-2">
                    <ProductPrice product={product} size="sm" />
                  </div>
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