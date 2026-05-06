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
}: any) {
  const [qty, setQty] = useState(1)

  const price =
    displayVariant?.price ??
    variant?.price ??
    product?.individual_price ??
    0

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 flex-wrap">
        <QuantitySelector qty={qty} setQty={setQty} />

        <div className="text-xl font-bold text-brand-blue whitespace-nowrap">
          <ProductPrice price={price} />
        </div>

        <AddToCartButton
          product={product}
          variant={variant}
          quantity={qty}
          iconOnly
        />

        <WishlistButton product={product} iconOnly />
      </div>
    </div>
  )
}