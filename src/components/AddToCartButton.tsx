"use client"

import { useCart } from "@/store/useCart"
import { toast } from "sonner"
import { useLocale, useTranslations } from "next-intl"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "@/i18n/routing"

export default function AddToCartButton({
  product,
  variant,
  quantity = 1,
  disabled,
  iconOnly = false,
  redirectToProductOnMissingVariant = false,
}: any) {
  const { addItem } = useCart()

  const locale = useLocale()
  const router = useRouter()
  const isArabic = locale === "ar"

  const t = useTranslations("Product")

  const productName = isArabic
    ? product.name_ar || product.name_en
    : product.name_en

  const hasVariants = product.product_variants?.length > 0

  const handleAddToCart = () => {
    if (hasVariants && !variant) {
      toast.error(
        isArabic
          ? "يرجى اختيار الخيارات أولاً"
          : "Please choose product options first",
        { duration: 2000 }
      )

      if (redirectToProductOnMissingVariant) {
        router.push(`/products/${product.id}?chooseOptions=true`)
      }

      return
    }

    if (variant) {
      addItem({
        product_id: product.id,
        product_code: product.product_code || null,

        variant_id: variant.id,
        variant_code: variant.variant_code || null,

        name: productName,
        image: variant.variant_image || product.images?.[0],
        price: variant.price,
        quantity,

        diameter: variant.diameter,
        thickness: variant.thickness,
        width: variant.width,
        length: variant.length,
        hole_size: variant.hole_size,
        grit: variant.grit,
        machine: variant.machine,
        stand: variant.stand,

        material_name_en: variant.material_name_en,
        material_name_ar: variant.material_name_ar,

        quality_name_en: variant.quality_name_en,
        quality_name_ar: variant.quality_name_ar,
      })

      toast.success(t("added"), { duration: 500 })
      return
    }

    addItem({
      product_id: product.id,
      product_code: product.product_code || null,

      variant_id: "default",
      variant_code: null,

      name: productName,
      image: product.images?.[0],
      price: product.individual_price,
      quantity,
    })

    toast.success(t("added"), { duration: 500 })
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      aria-label={isArabic ? "أضف إلى السلة" : "Add to Cart"}
      className={`
        ${iconOnly ? "h-14 w-14" : "w-full h-12"}
        rounded-xl font-semibold transition flex items-center justify-center gap-2
        ${
          disabled
            ? "bg-gray-300 cursor-not-allowed text-gray-600"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }
      `}
    >
      <ShoppingCart className="w-5 h-5" />

      {!iconOnly && <span>{isArabic ? "أضف إلى السلة" : "Add to Cart"}</span>}
    </button>
  )
}