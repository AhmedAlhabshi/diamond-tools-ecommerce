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
<div className="flex items-start justify-between gap-4">

  <div className="flex-1 min-w-0">

    <div className="flex flex-wrap gap-2 mb-1">
      {product.brands?.map((brand: any) => (
        <Link
          key={brand.id}
          href={`/products?brand=${brand.id}`}
          className="
            text-sm uppercase tracking-widest
            text-black font-semibold
            underline
            hover:text-blue-600 transition
          "
        >
          {isArabic
            ? brand.name_ar || brand.name
            : brand.name}
        </Link>
      ))}
    </div>

<h1 className="text-2xl sm:text-4xl font-semibold text-black leading-none">
  {productName}
</h1>

{product.made_in && (
  <div className="mt-2 text-sm text-gray-600">
    <span className="font-medium">
      {isArabic ? "بلد الصنع:" : "Made in:"}
    </span>{" "}
    {product.made_in}
  </div>
)}

  </div>

  {product.brands?.length > 0 && (
    <div className="shrink-0 grid grid-cols-2 gap-3 items-center">
      {product.brands.map((brand: any) => (
        <img
          key={brand.id}
          src={brand.image}
          alt="Brand"
          className="w-20 sm:w-28 object-contain"
        />
      ))}
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