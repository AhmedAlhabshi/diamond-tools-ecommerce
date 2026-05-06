"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { useParams, useRouter } from "next/navigation";

export default function CategoryProductsPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();

  const categoryId = params.id as string;

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    const { data: productsData } = await supabase
      .from("products")
      .select("id, name_en, name_ar, images, category_sort_order")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("category_sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    setCategory(categoryData);
    setProducts(productsData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (categoryId) fetchData();
  }, [categoryId]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setProducts(items);

    for (let i = 0; i < items.length; i++) {
      await supabase
        .from("products")
        .update({ category_sort_order: i })
        .eq("id", items[i].id);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        Loading category products...
      </div>
    );
  }

  return (
    <div className="admin-panel p-8 bg-gray-100 min-h-screen">

      <button
        onClick={() => router.push("/en/admin/categories")}
        className="mb-5 text-blue-600 font-semibold"
      >
        ← Back to Categories
      </button>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">
        Manage Products Order
      </h1>

      <p className="text-gray-600 mb-6">
        Category:{" "}
        <span className="font-semibold">
          {category?.name_en} ({category?.name_ar})
        </span>
      </p>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Drag products to reorder
        </h2>

        {products.length === 0 ? (
          <div className="text-gray-500">
            No products found in this category.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="category-products">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {products.map((product, index) => (
                    <Draggable
                      key={product.id}
                      draggableId={product.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border border-gray-200 p-4 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">

                            <div className="text-gray-400 font-bold w-6">
                              {index + 1}
                            </div>

                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name_en}
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                No Image
                              </div>
                            )}

                            <div>
                              <div className="font-semibold text-gray-900">
                                {product.name_en}
                              </div>

                              <div className="text-sm text-gray-500">
                                {product.name_ar}
                              </div>
                            </div>

                          </div>

                          <div className="text-sm text-gray-400">
                            Drag to move
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}