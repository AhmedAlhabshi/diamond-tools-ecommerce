"use client"

import { useState } from "react"
import QuantitySelector from "./QuantitySelector"
import AddToCartButton from "./AddToCartButton"
import ProductPrice from "@/components/product-price"
import WishlistButton from "@/components/WishlistButton"

export default function ProductActions({
  product,
  variant,
  displayVariant,
  unitLabel,
}: any) {
  const [qty, setQty] = useState(1)
  const quoteOnly = product?.quote_only || displayVariant?.quote_only || variant?.quote_only

  const price =
    displayVariant?.price ??
    variant?.price ??
    product?.individual_price ??
    0

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 flex-wrap">
        {!quoteOnly && (
          <QuantitySelector qty={qty} setQty={setQty} unitLabel={unitLabel} />
        )}

        <div className="text-xl font-bold text-brand-blue whitespace-nowrap">
          <ProductPrice product={product} variant={displayVariant || variant} price={price} />
        </div>

        {!quoteOnly ? (
          <AddToCartButton product={product} variant={variant} quantity={qty} iconOnly />
        ) : (
          <button type="button" onClick={() => window.dispatchEvent(new Event("open-quote-modal"))} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Request Quote
          </button>
        )}

        <WishlistButton product={product} iconOnly />
      </div>
    </div>
  )
}