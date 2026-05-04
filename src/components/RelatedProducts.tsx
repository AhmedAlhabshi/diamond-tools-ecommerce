import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import AddToCartButton from "./AddToCartButton";
import ProductPrice from "@/components/product-price";
import { getTranslations } from "next-intl/server";

export default async function RelatedProducts({
  categoryId,
  brandId,
  currentProductId,
  locale
}: {
  categoryId: string;
  brandId: string;
  currentProductId: string;
  locale: string;
}) {

  const supabase = await createClient();
  const t = await getTranslations("Product");

  const isArabic = locale === "ar";

  const getName = (product: any) =>
    isArabic ? product.name_ar || product.name_en : product.name_en;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* ================= 🔥 RELATED LOGIC ================= */

  // 1️⃣ جيب IDs
  const { data: rel } = await supabase
    .from("related_products")
    .select("related_id")
    .eq("product_id", currentProductId);

  let products: any[] = [];

  if (rel && rel.length > 0) {

    const ids = rel.map((r: any) => r.related_id);

    // 2️⃣ جيب المنتجات المرتبطة
    const { data: manualProducts } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (id, price)
      `)
      .in("id", ids);

    products = manualProducts || [];

  } else {

    // 3️⃣ fallback
    const { data: fallback } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (id, price)
      `)
      .or(`category_id.eq.${categoryId},brand_id.eq.${brandId}`)
      .neq("id", currentProductId)
      .limit(4);

    products = fallback || [];
  }

  if (!products.length) return null;

  /* ================= FORMAT ================= */

  const formatted = products.map((product: any) => {

    let lowestVariant = null;

    if (product.product_variants?.length > 0) {
      lowestVariant = product.product_variants.reduce((min: any, current: any) =>
        current.price < min.price ? current : min
      );
    }

    return {
      ...product,
      variant: lowestVariant
    };
  });

  return (
    <div className="mt-16">

      <h2 className="text-2xl font-bold mb-6">
        {t("related")}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {formatted.map((product: any) => (

          <div
            key={product.id}
            className="bg-white border rounded-xl p-4 hover:shadow-lg transition"
          >

            <Link href={`/products/${product.id}`}>

              <div className="aspect-square  flex items-center justify-center mb-4">

                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    className="w-full h-full object-contain"
                  />
                )}

              </div>

              <h3 className="font-semibold mb-2 line-clamp-2">
                {getName(product)}
              </h3>

            </Link>

            <ProductPrice
              product={product}
              variant={product.variant}
            />

            {user && (
              <AddToCartButton product={product} />
            )}

          </div>

        ))}

      </div>

    </div>
  );
}