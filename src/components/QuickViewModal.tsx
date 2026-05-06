"use client"

import { X, ShoppingCart } from "lucide-react"
import ProductPrice from "@/components/product-price"
import { useCart } from "@/store/useCart"
import { toast } from "sonner"
import { Link, useRouter } from "@/i18n/routing"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

export default function QuickViewModal({ product, open, onClose }: any) {
  const { addItem } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open || !product) return null

  const variants = product.product_variants || []

  const hasVariants = variants.length > 0

  // ✅ still show cheapest price only for display
  const cheapestVariant =
    variants.length > 0
      ? variants.reduce(
          (min: any, v: any) => (v.price < min.price ? v : min),
          variants[0]
        )
      : null

  const shortDescription = product.description_en
    ? product.description_en.replace(/<[^>]*>/g, "").slice(0, 180)
    : ""

  const handleAddToCart = () => {
    // ✅ If product has variants, force user to choose from product page
    if (hasVariants) {
      toast.error("Please choose product options first", {
        duration: 2000,
      })

      onClose()
      router.push(`/products/${product.id}?chooseOptions=true`)
      return
    }

    // ✅ Product without variants can be added directly
    addItem({
      product_id: product.id,
      variant_id: "default",
      name: product.name_en,
      image: product.images?.[0],
      price: product.individual_price,
      quantity: 1,
    })

    toast.success("Added to cart")
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative overflow-hidden z-10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="bg-gray-50 p-12 flex items-center justify-center min-h-[420px]">
            <img
              src={product.images?.[0]}
              className="max-h-[360px] w-auto object-contain"
              alt={product.name_en}
            />
          </div>

          <div className="p-8 space-y-5">
            <h2 className="text-2xl font-semibold text-gray-800">
              {product.name_en}
            </h2>

            <ProductPrice product={product} variant={cheapestVariant} />

            <div className="space-y-2 text-gray-600 text-sm leading-relaxed">
              {shortDescription
                .split(".")
                .filter((line: string) => line.trim() !== "")
                .slice(0, 3)
                .map((line: string, index: number) => (
                  <p
                    key={index}
                    className="border-l-4 border-blue-600 pl-3 bg-slate-50 rounded-md py-2"
                  >
                    {line.trim()}.
                  </p>
                ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <Link
                href={`/products/${product.id}`}
                className="flex items-center justify-center border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                View Product
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}