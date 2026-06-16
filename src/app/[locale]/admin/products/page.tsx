import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/actions/products";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; q?: string }>;
}) {
  const { updated, q } = await searchParams;
  const searchQuery = q?.toLowerCase().trim() || "";

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("category_sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_en, name_ar, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.log("Error loading products:", error);
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(
      (cat) => String(cat.id) === String(categoryId)
    );

    return category?.name_en || "Uncategorized";
  };

  const getCategoryArabicName = (categoryId: string) => {
    const category = categories?.find(
      (cat) => String(cat.id) === String(categoryId)
    );

    return category?.name_ar || "";
  };

  const filteredProducts = (products || []).filter((product: any) => {
    if (!searchQuery) return true;

    const categoryName = getCategoryName(product.category_id);
    const categoryNameAr = getCategoryArabicName(product.category_id);

    return (
      product.name_en?.toLowerCase().includes(searchQuery) ||
      product.name_ar?.toLowerCase().includes(searchQuery) ||
      product.product_code?.toLowerCase().includes(searchQuery) ||
      product.code?.toLowerCase().includes(searchQuery) ||
      categoryName?.toLowerCase().includes(searchQuery) ||
      categoryNameAr?.toLowerCase().includes(searchQuery)
    );
  });

  const groupedProducts = filteredProducts.reduce((groups: any, product: any) => {
    const categoryName = getCategoryName(product.category_id);

    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }

    groups[categoryName].push(product);
    return groups;
  }, {});

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>

        <div className="flex items-center gap-3">
          <Link
            href="./products/order"
            className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800"
          >
            Arrange All Products
          </Link>

          <Link
            href="./products/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Product
          </Link>
        </div>
      </div>

      {updated && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          Product updated successfully
        </div>
      )}

      <form method="GET" className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search by product name, code, or category..."
            className="w-full border border-gray-300 rounded px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>

          {searchQuery && (
            <Link
              href="./products"
              className="bg-gray-200 text-slate-800 px-5 py-2 rounded hover:bg-gray-300"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {searchQuery && (
        <div className="mb-4 text-sm text-slate-600">
          Showing {filteredProducts.length} result(s) for{" "}
          <span className="font-semibold">"{q}"</span>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedProducts).length > 0 ? (
          Object.entries(groupedProducts).map(([categoryName, items]: any) => (
            <div
              key={categoryName}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="text-lg font-bold">{categoryName}</h2>
                <p className="text-sm text-slate-300">{items.length} products</p>
              </div>

              {items.map((product: any) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center border-b p-4 hover:bg-slate-50"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {product.name_en}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.name_ar}
                    </div>

                    {(product.product_code || product.code) && (
                      <div className="text-sm text-blue-600 mt-1">
                        Code: {product.product_code || product.code}
                      </div>
                    )}

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
                      className="px-3 py-1 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                      Variants
                    </Link>

                    <form action={deleteProduct.bind(null, product.id)}>
                      <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}