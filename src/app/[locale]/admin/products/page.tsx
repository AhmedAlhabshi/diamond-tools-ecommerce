import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/actions/products";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    updated?: string;
    q?: string;
    groupBy?: "category" | "brand";
  }>;
}) {
  const { updated, q, groupBy = "category" } = await searchParams;
  const searchQuery = q?.toLowerCase().trim() || "";

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (
        variant_code
      )
    `)
    .eq("is_active", true)
    .order("category_sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_en, name_ar, sort_order")
    .order("sort_order", { ascending: true });

  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, name_ar, sort_order")
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

  const getBrandName = (brandId: string) => {
    const brand = brands?.find((b) => String(b.id) === String(brandId));

    return brand?.name || "No Brand";
  };

  const getBrandArabicName = (brandId: string) => {
    const brand = brands?.find((b) => String(b.id) === String(brandId));

    return brand?.name_ar || "";
  };

  const getProductVariantCodes = (product: any) => {
    return (
      product.product_variants
        ?.map((variant: any) => variant.variant_code)
        .filter(Boolean) || []
    );
  };

  const filteredProducts = (products || []).filter((product: any) => {
    if (!searchQuery) return true;

    const categoryName = getCategoryName(product.category_id);
    const categoryNameAr = getCategoryArabicName(product.category_id);
    const brandName = getBrandName(product.brand_id);
    const brandNameAr = getBrandArabicName(product.brand_id);

    const variantCodes = getProductVariantCodes(product);

    const hasMatchingVariantCode = variantCodes.some((code: string) =>
      String(code).toLowerCase().includes(searchQuery)
    );

    return (
      product.name_en?.toLowerCase().includes(searchQuery) ||
      product.name_ar?.toLowerCase().includes(searchQuery) ||
      product.product_code?.toLowerCase().includes(searchQuery) ||
      product.code?.toLowerCase().includes(searchQuery) ||
      hasMatchingVariantCode ||
      categoryName?.toLowerCase().includes(searchQuery) ||
      categoryNameAr?.toLowerCase().includes(searchQuery) ||
      brandName?.toLowerCase().includes(searchQuery) ||
      brandNameAr?.toLowerCase().includes(searchQuery)
    );
  });

  const groupedProducts = filteredProducts.reduce((groups: any, product: any) => {
    const groupName =
      groupBy === "brand"
        ? getBrandName(product.brand_id)
        : getCategoryName(product.category_id);

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(product);
    return groups;
  }, {});

  const buildHref = (nextGroupBy: "category" | "brand") => {
    const params = new URLSearchParams();

    params.set("groupBy", nextGroupBy);

    if (q) {
      params.set("q", q);
    }

    return `./products?${params.toString()}`;
  };

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

      <form method="GET" className="mb-4 bg-white p-4 rounded-lg shadow">
        <input type="hidden" name="groupBy" value={groupBy} />

        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search by product name, product code, variant code, category, or brand..."
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
              href={`./products?groupBy=${groupBy}`}
              className="bg-gray-200 text-slate-800 px-5 py-2 rounded hover:bg-gray-300"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      <div className="mb-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900">Arrange products by</div>
          <div className="text-sm text-slate-500">
            Current view: {groupBy === "brand" ? "Brand" : "Category"}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={buildHref("category")}
            className={`px-4 py-2 rounded border ${
              groupBy === "category"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-800 hover:bg-gray-100"
            }`}
          >
            Category
          </Link>

          <Link
            href={buildHref("brand")}
            className={`px-4 py-2 rounded border ${
              groupBy === "brand"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-800 hover:bg-gray-100"
            }`}
          >
            Brand
          </Link>
        </div>
      </div>

      {searchQuery && (
        <div className="mb-4 text-sm text-slate-600">
          Showing {filteredProducts.length} result(s) for{" "}
          <span className="font-semibold">"{q}"</span>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedProducts).length > 0 ? (
          Object.entries(groupedProducts).map(([groupName, items]: any) => (
            <div
              key={groupName}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="text-lg font-bold">{groupName}</h2>
                <p className="text-sm text-slate-300">
                  {items.length} products
                </p>
              </div>

              {items.map((product: any) => {
                const variantCodes = getProductVariantCodes(product);

                return (
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
                          Product Code: {product.product_code || product.code}
                        </div>
                      )}

                      {variantCodes.length > 0 && (
                        <div className="text-sm text-purple-600 mt-1">
                          Variant Codes: {variantCodes.join(", ")}
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mt-1">
                        Category: {getCategoryName(product.category_id)}
                      </div>

                      <div className="text-sm text-gray-500 mt-1">
                        Brand: {getBrandName(product.brand_id)}
                      </div>

                      <div className="text-sm text-gray-400 mt-1">
                        Stock: {product.stock}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-slate-700 font-medium">
                        {product.individual_price || product.price || 0} SAR
                      </div>

                      <Link
                        href={`./products/edit/${product.id}`}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </Link>

                      <Link
                        href={`./products/${product.id}/variants`}
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
                );
              })}
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