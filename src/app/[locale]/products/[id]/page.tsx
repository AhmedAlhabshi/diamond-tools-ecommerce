import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import RelatedProducts from "@/components/RelatedProducts";
import ProductTabs from "@/components/ProductTabs";
import ProductVariantsSelector from "@/components/ProductVariantsSelector";
import { Link } from "@/i18n/routing";
import WishlistButton from "@/components/WishlistButton";
import { getProductDownloads } from "@/app/actions/products";
import ProductQuoteBox from "@/components/ProductQuoteBox";
import { getTranslations } from "next-intl/server";
import ProductDetailsClient from "@/components/ProductDetailsClient"


export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {

  const { id, locale } = await params;

  const supabase = await createClient();
  

  const isArabic = locale === "ar";

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product || error) {
    return notFound();
  }

  // Variants
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id);

  // Category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", product.category_id)
    .single();

  // Brand
// Main Brand
const { data: brand } = await supabase
  .from("brands")
  .select("*")
  .eq("id", product.brand_id)
  .single();

// Additional Brands
const { data: productBrands } = await supabase
  .from("product_brands")
  .select(`
    brand:brands(*)
  `)
  .eq("product_id", product.id);

const extraBrands =
  productBrands?.map((item: any) => item.brand).filter(Boolean) || [];

const allBrands = [brand, ...extraBrands].filter(
  (brandItem, index, self) =>
    brandItem &&
    index === self.findIndex((b: any) => b.id === brandItem.id)
);

  /* ================= LANGUAGE LOGIC ================= */

  const productName = isArabic
    ? product.name_ar || product.name_en
    : product.name_en;

  const categoryName = isArabic
    ? category?.name_ar || category?.name_en
    : category?.name_en;

  const description = isArabic
    ? product.description_ar || product.description_en
    : product.description_en;

  const specifications = isArabic
    ? product.specifications_ar || product.specifications_en
    : product.specifications_en;

  const brandName = isArabic
  ? brand?.name_ar || brand?.name
  : brand?.name;  

const downloads = await getProductDownloads(product.id);

const tUnits = await getTranslations("Units");

const unitKey = product.unit || "quantity";
const unitLabel = tUnits(unitKey);

  return (

    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">

      {/* ================= Breadcrumb ================= */}
      <div className="text-sm text-gray-500 mb-4 flex flex-wrap items-center">

        <Link
          href="/"
          className="hover:text-black hover:underline transition"
        >
          {isArabic ? "الرئيسية" : "Home"}
        </Link>

        <span className="mx-1 text-gray-400">/</span>

        <Link
          href={`/products?category=${category?.id}`}
          className="hover:text-black hover:underline transition"
        >
          {categoryName}
        </Link>

        <span className="mx-1 text-gray-400">/</span>

        <span className="text-black font-medium">
          {productName}
        </span>

      </div>

      {/* ================= MAIN ================= */}
<ProductDetailsClient
  product={{
    ...product,
    brand,
    brands: allBrands,
  }}
  variants={variants || []}
  unitLabel={unitLabel}
  locale={locale}
/>

      {/* ================= Tabs ================= */}
      <div className="mt-8 sm:mt-12">
<ProductTabs
  description={locale === "ar" ? product.description_ar : product.description_en}
  specifications={locale === "ar" ? product.specifications_ar : product.specifications_en}
  downloads={downloads}
/>
      </div>

      {/* ================= Related ================= */}
      <div className="mt-8 sm:mt-12">
<RelatedProducts
  categoryId={product.category_id}
  brandId={product.brand_id}
  currentProductId={product.id}
  locale={locale}
/>
      </div>

    </div>
  );
}