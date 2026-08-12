import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim();
  const all = searchParams.get("all") === "true";

  if (!q && !all) return NextResponse.json([]);

  const supabase = await createClient();

  const { data: matchingBrands, error: brandSearchError } = q
    ? await supabase
        .from("brands")
        .select("id")
        .or(`name.ilike.%${q}%,name_ar.ilike.%${q}%`)
    : { data: [], error: null };

  if (brandSearchError) {
    console.error("Brand search error:", brandSearchError);
    return NextResponse.json([]);
  }

  const brandIds = matchingBrands?.map((brand) => brand.id) || [];
  let brandProductIds: string[] = [];

  if (brandIds.length > 0) {
    const [primaryBrands, additionalBrands] = await Promise.all([
      supabase.from("products").select("id").eq("is_active", true).in("brand_id", brandIds),
      supabase.from("product_brands").select("product_id").in("brand_id", brandIds),
    ]);

    if (primaryBrands.error || additionalBrands.error) {
      console.error("Brand product search error:", primaryBrands.error || additionalBrands.error);
      return NextResponse.json([]);
    }

    brandProductIds = [
      ...(primaryBrands.data?.map((product) => product.id) || []),
      ...(additionalBrands.data?.map((product) => product.product_id) || []),
    ].filter((id, index, ids) => ids.indexOf(id) === index);
  }

  const filters = q
    ? [
        `name_en.ilike.%${q}%`,
        `name_ar.ilike.%${q}%`,
        `product_code.ilike.%${q}%`,
      ]
    : [];

  if (brandProductIds.length > 0) {
    filters.push(`id.in.(${brandProductIds.join(",")})`);
  }

  let query = supabase
    .from("products")
    .select(`
      id,
      name_en,
      name_ar,
      product_code,
      images,
      individual_price,
      quote_only,
      product_variants (
        id,
        price,
        quote_only
      )
    `)
    .eq("is_active", true);

  if (filters.length > 0) {
    query = query.or(filters.join(","));
  }

  if (!all) {
    query = query.limit(5);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Search API error:", error);
    return NextResponse.json([]);
  }

  const formatted = data?.map((product) => {
    let lowestVariant = null;

    if (product.product_variants?.length > 0) {
      const purchasableVariants = product.product_variants.filter((variant: any) => !variant.quote_only);
      const variantsToCompare = purchasableVariants.length > 0 ? purchasableVariants : product.product_variants;
      lowestVariant = variantsToCompare.reduce((min: any, current: any) =>
        current.price < min.price ? current : min
      );
    }

    return {
      ...product,
      variant: lowestVariant,
    };
  });

  return NextResponse.json(formatted || []);
}