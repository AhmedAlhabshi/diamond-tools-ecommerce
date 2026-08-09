import { createClient } from '@supabase/supabase-js'

export const SITE_URL = 'https://diamondtools-est.com'

export type CatalogVariant = {
  id: string
  price: number | null
  stock: number | null
  quote_only: boolean | null
  variant_code: string | null
}

export type CatalogProduct = {
  id: string
  name_en: string
  name_ar: string | null
  description_en: string | null
  description_ar: string | null
  images: string[] | null
  individual_price: number | null
  discount_price: number | null
  price: number | null
  stock: number | null
  created_at: string | null
  product_code: string | null
  quote_only: boolean | null
  is_active: boolean | null
  brand: { name: string } | null
  product_variants: CatalogVariant[] | null
}

function getCatalogClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase public environment variables are required')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const catalogSelect = `
  id,
  name_en,
  name_ar,
  description_en,
  description_ar,
  images,
  individual_price,
  discount_price,
  price,
  stock,
  created_at,
  product_code,
  quote_only,
  is_active,
  brand:brands!products_brand_id_fkey(name),
  product_variants!product_variants_product_id_fkey(
    id,
    price,
    stock,
    quote_only,
    variant_code
  )
`

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await getCatalogClient()
    .from('products')
    .select(catalogSelect)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Unable to build the public product catalog:', error)
    return []
  }

  return (data || []) as unknown as CatalogProduct[]
}

export async function getCatalogProduct(id: string): Promise<CatalogProduct | null> {
  const { data, error } = await getCatalogClient()
    .from('products')
    .select(catalogSelect)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error(`Unable to load product ${id} for SEO:`, error)
    return null
  }

  return data as unknown as CatalogProduct | null
}

export function getPurchasablePrice(product: CatalogProduct): number | null {
  if (product.quote_only) return null

  const variantPrices = (product.product_variants || [])
    .filter((variant) => !variant.quote_only && Number(variant.price) > 0)
    .map((variant) => Number(variant.price))

  if (variantPrices.length > 0) return Math.min(...variantPrices)

  const productPrice = product.individual_price ?? product.price
  return productPrice != null && Number(productPrice) > 0 ? Number(productPrice) : null
}

export function isInStock(product: CatalogProduct): boolean {
  const purchasableVariants = (product.product_variants || []).filter(
    (variant) => !variant.quote_only,
  )

  if (purchasableVariants.length > 0) {
    return purchasableVariants.some((variant) => Number(variant.stock) > 0)
  }

  return Number(product.stock) > 0
}

export function plainText(value: string | null | undefined): string {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function absoluteUrl(value: string): string {
  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
