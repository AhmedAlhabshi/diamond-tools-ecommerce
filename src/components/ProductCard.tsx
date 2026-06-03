"use client"

import { useCart } from "@/store/useCart"
import { useWishlist } from "@/store/useWishlist"
import { PackageSearch, ShoppingCart, Heart, Eye } from "lucide-react"
import { Link } from "@/i18n/routing"
import ProductPrice from "@/components/product-price"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"




export default function ProductCard({ product, onQuickView }: any) {

  const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

const { addItem } = useCart()
const { toggleItem, isInWishlist } = useWishlist()

const inWishlist =
  mounted ? isInWishlist(product.id) : false

  const locale = useLocale()
  const isArabic = locale === "ar"

  const t = useTranslations("Product")
  

  


  /* ================= LANGUAGE FIX ================= */
  const productName = isArabic
    ? product.name_ar || product.name_en
    : product.name_en

  const variants = product.product_variants || []

const cheapestVariant = variants.length > 0
  ? variants.reduce((min: any, v: any) =>
      v.price < min.price ? v : min
    , variants[0])
  : null

  



  return (

    <div className="relative flex-shrink-0 
      w-[220px] sm:w-[48%] md:w-[32%] lg:w-[20%]
      bg-white border rounded-xl overflow-hidden 
      hover:shadow-lg hover:-translate-y-1 
      transition-all duration-300 snap-start">

      {/* ================= IMAGE ================= */}
      <div className="group relative h-28 sm:h-32 bg-transparent flex items-center justify-center p-3 overflow-hidden">

{product.brands?.length > 0 && (
  <div className="absolute -top-2 left-1 right-1 z-10 flex justify-between items-start pointer-events-none">
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

{product.images?.[0] ? (
  <>
    {/* Mobile: image opens product page */}
    <Link href={`/products/${product.id}`} className="sm:hidden">
      <img
        src={product.images[0]}
        className="max-h-24 object-contain transition duration-300"
      />
    </Link>

    {/* Desktop: keep exactly same behavior */}
    <img
      src={product.images[0]}
      className="hidden sm:block max-h-28 object-contain transition duration-300 group-hover:scale-110"
    />
  </>
) : (
  <PackageSearch />
)}

        {/* 🔥 DESKTOP HOVER */}
<div className="hidden sm:flex absolute inset-0 z-20
  opacity-0 group-hover:opacity-100
  transition duration-300
  flex-col justify-between p-2">

          {/* Icons */}
          <div className="flex justify-end gap-2">

            {/* ❤️ Wishlist */}
            <button
              onClick={(e) => {
                e.stopPropagation()

                toggleItem({
                  id: product.id,
                  name: productName,
                  image: product.images?.[0],
                })

                toast.success(
                  inWishlist ? t("removedWishlist") : t("addedWishlist"),
                  { duration: 500 }
                )
              }}
              className="bg-white shadow rounded-full p-2"
            >
              <Heart
                className={`w-4 h-4 ${
                  inWishlist
                    ? "text-red-500 fill-red-500"
                    : "text-gray-400"
                }`}
              />
            </button>

            {/* 👁 Quick View */}
            <button
              onClick={(e)=>{
                e.stopPropagation()
                onQuickView(product)
              }}
              className="bg-white shadow rounded-full p-2"
            >
              <Eye className="w-4 h-4"/>
            </button>

          </div>

          {/* 🛒 Add to Cart */}
          <button
            onClick={(e) => {
  e.preventDefault()
  e.stopPropagation()

  const hasVariants = product.product_variants?.length > 0

  if (hasVariants) {
    toast.error(t("chooseOptions") || "Please choose product options first", {
      duration: 2000,
    })

    // 🔥 redirect to product page
    window.location.href = `/products/${product.id}?chooseOptions=true`
    return
  }

  // ✅ no variants → normal add
  addItem({
    product_id: product.id,
    variant_id: "default",
    name: productName,
    image: product.images?.[0],
    price: product.individual_price,
    quantity: 1,
  })

  toast.success(t("added"), { duration: 500 })
}}
            className="
              bg-white border py-2 rounded-lg text-sm font-semibold
              flex items-center justify-center gap-2
              hover:bg-gray-50
              translate-y-6 opacity-0
              group-hover:translate-y-0 group-hover:opacity-100
              transition duration-300
            "
          >
            <ShoppingCart className="w-4 h-4"/>
            {t("add")}
          </button>

        </div>

      </div>

      {/* ================= CONTENT ================= */}
      <Link href={`/products/${product.id}`}>

        <div className="p-3 sm:p-4 text-center cursor-pointer">

<h3
  className="
    text-sm font-medium
    whitespace-nowrap
    hover:text-blue-600
    transition
  "
  style={{ letterSpacing: "2px" }}
>
  {productName}
</h3>

{product.made_in && (
  <p className="text-xs text-gray-500 mt-1">
    {isArabic ? "بلد الصنع:" : "Made in:"} {product.made_in}
  </p>
)}

<div className="mt-1 transition duration-300">
  <ProductPrice
    product={product}
    variant={cheapestVariant}
  />
</div>

        </div>

      </Link>

      {/* 🔥 MOBILE BUTTON */}
      <div className="sm:hidden px-3 pb-3">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()

const item = cheapestVariant
  ? {
      product_id: product.id,
      variant_id: cheapestVariant.id,
      name: productName,
      image: product.images?.[0],
      price: cheapestVariant.price,
      quantity: 1,
      diameter: cheapestVariant.diameter,
      thickness: cheapestVariant.thickness,
      hole_size: cheapestVariant.hole_size,
      grit: cheapestVariant.grit,
      length: cheapestVariant.length,
    }
              : {
                  product_id: product.id,
                  variant_id: "default",
                  name: productName,
                  image: product.images?.[0],
                  price: product.individual_price,
                  quantity: 1,
                }

            addItem(item)

            toast.success(t("added"), { duration: 500 })
          }}
          className="
            w-full border py-2 rounded-lg text-sm 
            flex items-center justify-center gap-2
            active:scale-95 transition
          "
        >
          <ShoppingCart className="w-4 h-4" />
          {t("add")}
        </button>
      </div>

    </div>
  )
}