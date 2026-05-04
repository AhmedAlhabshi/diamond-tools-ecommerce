"use client"

import { useState } from "react"
import ProductCard from "@/components/ProductCard"
import QuickViewModal from "@/components/QuickViewModal"
import CategorySlider from "@/components/CategorySlider"

export default function FeaturedProducts({ products }: any) {

  const [quickProduct, setQuickProduct] = useState(null)

  return (
    <>
      
      {/* 🔥 DESKTOP SLIDER */}
      <div className="hidden md:block">
        <CategorySlider id="prodScroll">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickProduct}
            />
          ))}
        </CategorySlider>
      </div>

      {/* 🔥 MOBILE SCROLL */}
      <div className="md:hidden flex gap-4 overflow-x-auto px-4">

        {products.map((product: any) => (
          <div key={product.id} className="min-w-[220px] flex-shrink-0">
            <ProductCard
              product={product}
              onQuickView={setQuickProduct}
            />
          </div>
        ))}

      </div>

      <QuickViewModal
        product={quickProduct}
        open={!!quickProduct}
        onClose={() => setQuickProduct(null)}
      />

    </>
  )
}