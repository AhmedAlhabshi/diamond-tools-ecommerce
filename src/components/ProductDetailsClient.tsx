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

  {/* Title */}
  <div>
    <h1 className="text-2xl sm:text-4xl font-semibold text-black leading-none">
      {productName}
    </h1>
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