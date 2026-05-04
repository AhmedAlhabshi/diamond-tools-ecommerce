"use client"

import { Heart } from "lucide-react"
import { toast } from "sonner"
import { useWishlist } from "@/store/useWishlist"
import { useLocale, useTranslations } from "next-intl"

export default function WishlistButton({
  product,
  iconOnly = false,
}: any) {
  const { toggleItem, items } = useWishlist()

  const locale = useLocale()
  const isArabic = locale === "ar"

  const t = useTranslations("Product")

  const inWishlist = items.some((item) => item.id === product.id)

  const productName = isArabic
    ? product.name_ar || product.name_en
    : product.name_en

  return (
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
      aria-label={inWishlist ? t("remove") : t("addWishlist")}
      className={`
        ${iconOnly ? "h-14 w-14" : "w-full py-3"}
        flex items-center justify-center gap-2
        border rounded-xl text-sm font-medium
        hover:bg-gray-50 transition
      `}
    >
      <Heart
        className={`w-5 h-5 ${
          inWishlist
            ? "text-red-500 fill-red-500"
            : "text-gray-400"
        }`}
      />

      {!iconOnly && (
        <span>
          {inWishlist ? t("remove") : t("addWishlist")}
        </span>
      )}
    </button>
  )
}