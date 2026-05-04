"use client"

import { useWishlist } from "@/store/useWishlist"
import { Link } from "@/i18n/routing"
import { Heart } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export default function WishlistPage() {

  const t = useTranslations("Wishlist")
  const locale = useLocale()

  const { items, toggleItem } = useWishlist()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-heading mb-8">
        {t("title")}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Heart className="mx-auto mb-3 w-8 h-8" />
          {t("empty")}
        </div>
      ) : (

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 text-center hover:shadow-md transition"
            >

              <Link href={`/products/${item.id}`}>

                <img
                  src={item.image}
                  className="h-24 mx-auto object-contain mb-3"
                />

<h3 className="text-sm font-medium line-clamp-2">
  {item.name}
</h3>

              </Link>

              {/* Remove */}
              <button
                onClick={() => toggleItem(item)}
                className="mt-3 text-sm text-red-500 hover:underline"
              >
                {t("remove")}
              </button>

            </div>
          ))}

        </div>
      )}

    </div>
  )
}