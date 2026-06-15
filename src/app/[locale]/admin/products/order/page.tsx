import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/server"
import { updateAllProductsOrder } from "@/app/actions/products"

export default async function AdminAllProductsOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name_en, name_ar, images, all_products_sort_order, is_active")
    .eq("is_active", true)
    .order("all_products_sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error loading products order:", error)
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Arrange All Products Page
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            This order controls only the main All Products page.
          </p>
        </div>

        <Link
          href="../products"
          className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800"
        >
          Back to Products
        </Link>
      </div>

      {success && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          All products order saved successfully
        </div>
      )}

      <form action={updateAllProductsOrder}>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-[90px_1fr_180px] gap-4 bg-slate-900 text-white px-5 py-3 font-semibold">
            <div>Image</div>
            <div>Product</div>
            <div>Order</div>
          </div>

          {(products || []).map((product: any, index: number) => {
            const image =
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : null

            return (
              <div
                key={product.id}
                className="grid grid-cols-[90px_1fr_180px] gap-4 items-center border-b px-5 py-4 hover:bg-slate-50"
              >
                <div>
                  <input type="hidden" name="product_id" value={product.id} />

                  <div className="relative w-16 h-16 rounded bg-gray-100 border overflow-hidden">
                    {image ? (
<img
  src={image}
  alt={product.name_en}
  className="w-full h-full object-contain p-1"
/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-900">
                    {product.name_en}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.name_ar}
                  </div>
                </div>

                <div>
                  <input
                    type="number"
                    name={`all_products_sort_order_${product.id}`}
                    defaultValue={
                      product.all_products_sort_order ?? (index + 1) * 10
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
          >
            Save Order
          </button>
        </div>
      </form>
    </div>
  )
}