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

  const { data: rel } = await supabase
    .from("related_products")
    .select("related_id")
    .eq("product_id", currentProductId);

  let products: any[] = [];

  if (rel && rel.length > 0) {
    const ids = rel.map((r: any) => r.related_id);

    const { data: manualProducts } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (id, price)
      `)
      .in("id", ids);

    products = manualProducts || [];
  } else {
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

  const productIds = products.map((product: any) => product.id);

  const { data: brands } = await supabase
    .from("brands")
    .select("*");

  const { data: productBrands } = await supabase
    .from("product_brands")
    .select(`
      product_id,
      brand:brands(*)
    `)
    .in("product_id", productIds);

  const formatted = products.map((product: any) => {
    let lowestVariant = null;

    if (product.product_variants?.length > 0) {
      lowestVariant = product.product_variants.reduce((min: any, current: any) =>
        current.price < min.price ? current : min
      );
    }

    const mainBrand =
      brands?.find((b: any) => String(b.id) === String(product.brand_id)) ||
      null;

    const extraBrands =
      productBrands
        ?.filter((pb: any) => String(pb.product_id) === String(product.id))
        ?.map((pb: any) => pb.brand)
        ?.filter(Boolean) || [];

    const allBrands = [mainBrand, ...extraBrands].filter(
      (brand, index, self) =>
        brand &&
        index === self.findIndex((b: any) => b.id === brand.id)
    );

    return {
      ...product,
      brand: mainBrand,
      brands: allBrands,
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
            className="relative bg-white border rounded-xl p-4 hover:shadow-lg transition"
          >

            {product.brands?.length > 0 && (
              <div className="absolute -top-2 left-1 right-1 z-30 flex justify-between items-start">
                {product.brands.map((brand: any) => (
                  <img
                    key={brand.id}
                    src={brand.image}
                    alt={brand.name_en || "Brand"}
                    className="w-12 h-12 object-contain"
                  />
                ))}
              </div>
            )}

            <Link href={`/products/${product.id}`}>

              <div className="aspect-square flex items-center justify-center mb-4">

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