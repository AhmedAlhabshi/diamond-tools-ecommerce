import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  if (!q) return NextResponse.json([])

  const supabase = await createClient()

const { data } = await supabase
  .from("products")
  .select(`
    id,
    name_en,
    name_ar,
    images,
    individual_price,
    product_variants (
      id,
      price
    )
  `)
  .eq("is_active", true)
  .or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`)
  .limit(5)

  const formatted = data?.map((product) => {

    let lowestVariant = null

    if (product.product_variants?.length > 0) {
      lowestVariant = product.product_variants.reduce((min: any, current: any) =>
        current.price < min.price ? current : min
      )
    }

    return {
      ...product,
      variant: lowestVariant // 🔥 IMPORTANT
    }
  })

  return NextResponse.json(formatted || [])
}