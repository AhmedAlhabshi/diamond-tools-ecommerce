import { getProducts, getCategories, getBrands } from '@/app/actions/products'
import { getTranslations } from 'next-intl/server'
import { PackageSearch } from 'lucide-react'
import { Link } from '@/i18n/routing'
import AddToCartButton from '@/components/AddToCartButton'
import { createClient } from "@/utils/supabase/server"
import ProductPrice from "@/components/product-price"
import ProductsClient from "@/components/ProductsClient"
import RequestQuoteButton from "@/components/RequestQuoteButton"

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string, brand?: string, price?: string, search?: string }>
}) {

  const { locale } = await params
  const { category, brand, price, search } = await searchParams

  const t = await getTranslations("Products") // ✅ NEW

  const [products, categories, brands] = await Promise.all([
    getProducts({ categoryId: category, brandId: brand, price, search }),
    getCategories(),
    getBrands(),
  ])

  const selectedCategory = categories.find(
    (cat:any) => String(cat.id) === String(category)
  )

  const selectedBrand = brands.find(
    (b:any) => String(b.id) === String(brand)
  )

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  /* 🔥 SIDEBAR */
  const sidebar = (
    <div className="space-y-6">

      {/* Category */}
      <div className="bg-white p-5 rounded-xl border">
        
        <h3 className="text-xl md:text-lg font-bold mb-4">
          {t("category")}
        </h3>

        <ul className="space-y-2">
          <li>
            <Link href="/products" className="block">
              {t("allCategories")}
            </Link>
          </li>

          {categories.map((cat:any) => (
            <li key={cat.id}>
              <Link href={`/products?category=${cat.id}`}>
                {locale === 'ar' ? cat.name_ar : cat.name_en}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Brand */}
      <div className="bg-white p-5 rounded-xl border">
        
        <h3 className="text-xl md:text-lg font-bold mb-4">
          {t("brand")}
        </h3>

        <ul className="space-y-2">
          {brands.map((b:any) => (
            <li key={b.id}>
              <Link href={`/products?brand=${b.id}`}>
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">

        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:block w-64 shrink-0">
          {sidebar}
        </div>

        {/* PRODUCTS */}
        <div className="flex-1">

          {/* MOBILE FILTER */}
          <ProductsClient sidebar={sidebar} />

          {/* HEADER */}
          <div className="mb-4 md:mb-6 flex justify-between items-center">

            <h1 className="text-xl md:text-3xl ">
              {selectedCategory
                ? (locale === 'ar'
                    ? selectedCategory.name_ar
                    : selectedCategory.name_en)
                : selectedBrand
                ? selectedBrand.name
                : t("allProducts")} {/* ✅ */}
            </h1>

            <span className="text-gray-500 text-sm">
              {products.length} {t("products")} {/* ✅ */}
            </span>

          </div>

          {/* PRODUCTS GRID */}
          {products.length === 0 ? (

            <div className="text-center py-16">
              <PackageSearch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              {t("noProducts")} {/* ✅ */}
            </div>

          ) : (

            <div className="
              grid 
              grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
              gap-3 sm:gap-4 md:gap-6
            ">

              {products.map((product: any) => (

<div
  key={product.id}
  className="relative bg-white border rounded-xl p-3 sm:p-4 flex flex-col h-full"
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

<div className="relative aspect-square flex items-center justify-center mb-3 p-2 overflow-hidden">



  {product.images?.[0] ? (
    <img
      src={product.images[0]}
      className="w-full h-full object-contain"
    />
  ) : (
    <PackageSearch />
  )}

</div>

<h3 className="text-sm sm:text-base mb-1 text-center w-full">  {locale === 'ar' ? product.name_ar : product.name_en}
</h3>

{product.made_in && (
  <p className="text-xs text-gray-500 text-center mb-2">
    {locale === "ar" ? "بلد الصنع:" : "Made in:"} {product.made_in}
  </p>
)}

  </Link>

  <div className="mt-auto flex flex-col gap-2">
    <ProductPrice
      product={product}
      variant={product.variant}
    />

    {product.quote_only || (product.product_variants?.length > 0 && product.product_variants.every((v: any) => v.quote_only)) ? (
      <RequestQuoteButton className="w-full" />
    ) : user ? (
      <AddToCartButton product={product} redirectToProductOnMissingVariant={true} />
    ) : null}
  </div>

</div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  )
}