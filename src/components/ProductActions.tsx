"use client";

import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import AddToCartButton from "./AddToCartButton";
import ProductPrice from "@/components/product-price";
import WishlistButton from "@/components/WishlistButton";

export default function ProductActions({ product, variant }: any) {
  const [qty, setQty] = useState(1);

  const hasVariants = product.product_variants?.length > 0;
  const disabled = hasVariants && !variant;

  const price =
    variant?.price ??
    product?.individual_price ??
    0;

  return (
    <div className="mt-4">

      <div className="flex items-center gap-3 flex-wrap">

        {/* Quantity */}
        <QuantitySelector qty={qty} setQty={setQty} />

        {/* Price */}
<div className="text-xl font-bold text-brand-blue whitespace-nowrap">
  <ProductPrice price={price} />
</div>
        {/* Add to Cart */}
        <AddToCartButton
          product={product}
          variant={variant}
          quantity={qty}
          disabled={disabled}
          iconOnly
        />

        {/* Wishlist */}
        <WishlistButton product={product} iconOnly />

      </div>

    </div>
  );
}