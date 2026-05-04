"use client"

import { useCart } from "@/store/useCart"
import { toast } from "sonner"
import { useLocale, useTranslations } from "next-intl"
import { ShoppingCart } from "lucide-react"

export default function AddToCartButton({
  product,
  variant,
  quantity = 1,
  disabled,
  iconOnly = false,
}: any) {
  const { addItem } = useCart()

  const locale = useLocale()
  const isArabic = locale === "ar"

  const t = useTranslations("Product")

  const productName = isArabic
    ? product.name_ar || product.name_en
    : product.name_en

  const hasVariants = product.product_variants?.length > 0

  const handleAddToCart = () => {
    let variantToUse = variant

    if (hasVariants && !variantToUse) {
      variantToUse = [...product.product_variants].sort(
        (a, b) => a.price - b.price
      )[0]
    }

    if (variantToUse) {
      addItem({
        product_id: product.id,
        variant_id: variantToUse.id,
        name: productName,
        image: product.images?.[0],
        price: variantToUse.price,
        quantity,
        diameter: variantToUse.diameter,
        thickness: variantToUse.thickness,
        hole_size: variantToUse.hole_size,
        grit: variantToUse.grit,
        length: variantToUse.length,
        machine: variantToUse.machine,
        material_name_en: variant?.material_name_en,
material_name_ar: variant?.material_name_ar,
      })

      toast.success(t("added"), { duration: 500 })
      return
    }

    addItem({
      product_id: product.id,
      name: productName,
      image: product.images?.[0],
      price: product.individual_price,
      quantity,
    })

    toast.success(t("added"), { duration: 500 })
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled}
      aria-label={t("Add to Cart")}
      className={`
       ${iconOnly ? "h-14 w-14" : "w-full h-12"}
        rounded-xl font-semibold transition flex items-center justify-center gap-2
        ${disabled
          ? "bg-gray-300 cursor-not-allowed text-gray-600"
          : "bg-blue-600 hover:bg-blue-700 text-white"}
      `}
    >
      <ShoppingCart className="w-5 h-5" />

      {!iconOnly && <span>{t("Add to Cart")}</span>}
    </button>
  )
}