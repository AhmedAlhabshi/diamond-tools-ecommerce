import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim();
  const all = searchParams.get("all") === "true";

  if (!q) return NextResponse.json([]);

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`
      id,
      name_en,
      name_ar,
      images,
      individual_price,
      quote_only,
      product_variants (
        id,
        price,
        quote_only
      )
    `)
    .eq("is_active", true)
    .or(
`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`);

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