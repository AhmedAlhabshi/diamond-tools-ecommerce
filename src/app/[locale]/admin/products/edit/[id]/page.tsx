import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditProductForm from "@/components/admin/EditProductForm";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product || error) {
    return notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name_en");

  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name_en")
    .neq("id", id);

  const { data: related } = await supabase
    .from("related_products")
    .select("related_id")
    .eq("product_id", id);

  const relatedIds = related?.map((r) => String(r.related_id)) || [];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      {sp?.success && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          Product Updated Successfully
        </div>
      )}

      <EditProductForm
        product={product}
        categories={categories || []}
        brands={brands || []}
        allProducts={allProducts || []}
        relatedIds={relatedIds}
      />
    </div>
  );
}