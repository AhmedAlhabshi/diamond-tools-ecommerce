import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/actions/products";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {

  const { updated } = await searchParams;

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error loading products:", error);
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Products
        </h1>

        <Link
          href="./products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      {updated && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          Product updated successfully
        </div>
      )}

      <div className="bg-white rounded-lg shadow">

        {products?.length === 0 && (
          <div className="p-6 text-slate-600">
            No products yet
          </div>
        )}

        {products?.map((product) => (

          <div
            key={product.id}
            className="flex justify-between items-center border-b p-4"
          >

            <div>

              <div className="font-semibold text-slate-900">
                {product.name_en}
              </div>

              <div className="text-sm text-gray-500">
                {product.name_ar}
              </div>

              <div className="text-sm text-gray-400 mt-1">
                Stock: {product.stock}
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="text-slate-700 font-medium">
                {product.price} SAR
              </div>

              <Link
                href={`./products/edit/${product.id}`}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </Link>

              <Link
  href={`/admin/products/${product.id}/variants`}
  className="px-3 py-1 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors "
>
  Variants
</Link>

              <form action={deleteProduct.bind(null, product.id)}>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </form>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}