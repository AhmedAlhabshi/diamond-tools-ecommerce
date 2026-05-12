"use client"

import { useState } from "react"
import ProductGallery from "@/components/ProductGallery"
import ProductVariantsSelector from "@/components/ProductVariantsSelector"
import ProductQuoteBox from "@/components/ProductQuoteBox"
import { Link } from "@/i18n/routing"

export default function ProductDetailsClient({
  product,
  variants,
  unitLabel,
  locale,
}: any) {

  const [selectedVariantImage, setSelectedVariantImage] = useState("")
  const isArabic = locale === "ar"

const productName = isArabic
  ? product.name_ar || product.name_en
  : product.name_en

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-start">

      {/* LEFT */}
      <ProductGallery
        images={product.images || []}
        selectedImage={selectedVariantImage}
      />

      {/* RIGHT */}
{/* RIGHT */}
<div className="space-y-2 sm:space-y-3">

{/* Brand + Title */}
<div className="flex items-center justify-between gap-4">

  <div>

   {product.brand?.name && (
  <Link
    href={`/products?brand=${product.brand.id}`}
    className="
      text-sm uppercase tracking-widest
      text-black font-semibold
      underline
      hover:text-blue-600 transition
      block mb-1
    "
  >
    {isArabic
      ? product.brand.name_ar || product.brand.name
      : product.brand.name}
  </Link>
)}

    <h1 className="text-2xl sm:text-4xl font-semibold text-black leading-none">
      {productName}
    </h1>

  </div>

  {product.brand?.image && (
    <div className="shrink-0 flex items-center">
      <img
        src={product.brand.image}
        alt="Brand"
        className="w-32 sm:w-40 object-contain"
      />
    </div>
  )}

</div>

  {/* Variants */}
  <div className="mt-4 sm:mt-6 space-y-3">

    <ProductVariantsSelector
      product={product}
      variants={variants || []}
      unitLabel={unitLabel}
      onVariantImageChange={setSelectedVariantImage}
    />

    <ProductQuoteBox locale={locale} />

  </div>

</div>

    </div>
  )
}