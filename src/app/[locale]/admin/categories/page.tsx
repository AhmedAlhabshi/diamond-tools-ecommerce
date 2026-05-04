"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

export default function CategoriesPage() {

  const supabase = createClient();

  const [categories, setCategories] = useState<any[]>([]);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [image, setImage] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= IMAGE ================= */

  const uploadImage = async () => {

    if (!image) return null;

    const fileName = `${Date.now()}-${image.name}`;

    const { error } = await supabase.storage
      .from("categories")
      .upload(fileName, image);

    if (error) {
      console.error(error);
      return null;
    }

    const { data } = supabase.storage
      .from("categories")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  /* ================= ADD ================= */

  const addCategory = async () => {

    const imageUrl = await uploadImage();

    await supabase.from("categories").insert({
      name_ar: nameAr || nameEn, // ✅ fallback
      name_en: nameEn,
      image: imageUrl,
      parent_id: parentId,
      slug: nameEn.toLowerCase().replace(/\s+/g, "-")
    });

    resetForm();
    fetchCategories();
  };

  /* ================= UPDATE ================= */

  const updateCategory = async () => {

    let imageUrl = null;

    if (image) {
      imageUrl = await uploadImage();
    }

    const updateData: any = {
      name_ar: nameAr || nameEn, // ✅ fallback
      name_en: nameEn,
      parent_id: parentId
    };

    if (imageUrl) {
      updateData.image = imageUrl;
    }

    await supabase
      .from("categories")
      .update(updateData)
      .eq("id", editingId);

    resetForm();
    fetchCategories();
  };

  /* ================= DELETE ================= */

const deleteCategory = async (id: string) => {

  const confirmDelete = confirm("Delete category and unlink products?")
  if (!confirmDelete) return

  // 🔍 get subcategories
  const { data: subCategories } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", id)

  const subIds = subCategories?.map((c) => c.id) || []
  const allCategoryIds = [id, ...subIds]

  // 🔥 unlink products (IMPORTANT)
  const { error: updateError } = await supabase
    .from("products")
    .update({
      category_id: null,
      sub_category_id: null
    })
    .in("category_id", allCategoryIds)

  if (updateError) {
    console.error(updateError)
    alert(updateError.message)
    return
  }

  // 🗑️ delete subcategories
  if (subIds.length > 0) {
    await supabase
      .from("categories")
      .delete()
      .in("id", subIds)
  }

  // 🗑️ delete main category
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)

  if (error) {
    console.error(error)
    alert(error.message)
    return
  }

  fetchCategories()
}

  /* ================= EDIT ================= */

  const editCategory = (cat: any) => {
    setEditingId(cat.id);
    setNameAr(cat.name_ar || "");
    setNameEn(cat.name_en || "");
    setParentId(cat.parent_id);
  };

  /* ================= RESET ================= */

  const resetForm = () => {
    setEditingId(null);
    setNameAr("");
    setNameEn("");
    setImage(null);
    setParentId(null);
  };

  /* ================= DRAG ================= */

  const handleDragEnd = async (result: any) => {

    if (!result.destination) return;

    const items = Array.from(categories);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setCategories(items);

    for (let i = 0; i < items.length; i++) {
      await supabase
        .from("categories")
        .update({ sort_order: i })
        .eq("id", items[i].id);
    }

  };

  /* ================= UI ================= */

  return (

    <div className="admin-panel p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Categories
      </h1>

      {/* FORM */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg mb-6">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {editingId ? "Edit Category" : "Add Category"}
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Name Arabic"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg"
          />

          <input
            placeholder="Name English"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg"
          />

          <select
            value={parentId || ""}
            onChange={(e) => setParentId(e.target.value || null)}
            className="w-full border border-gray-300 p-3 rounded-lg"
          >
            <option value="">Main Category</option>

            {categories
              .filter(cat => !cat.parent_id)
              .map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en} ({cat.name_ar})
                </option>
              ))
            }

          </select>

          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0])}
          />

          <div className="flex gap-3">

            <button
              onClick={editingId ? updateCategory : addCategory}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              {editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-300 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>

        </div>

      </div>

      {/* LIST */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          All Categories (Drag to reorder)
        </h2>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >

                {categories
                  .filter(cat => !cat.parent_id)
                  .map((cat, index) => (

                  <Draggable
                    key={cat.id}
                    draggableId={cat.id}
                    index={index}
                  >

                    {(provided) => (

                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50"
                      >

                        <div className="flex justify-between items-center">

                          <div className="flex items-center gap-4">

                            {cat.image && (
                              <img
                                src={cat.image}
                                className="w-14 h-14 object-cover rounded-lg"
                              />
                            )}

                            <div>
                              <div className="font-semibold">
                                {cat.name_en}
                              </div>

                              <div className="text-sm text-gray-500">
                                {cat.name_ar}
                              </div>
                            </div>

                          </div>

                          <div className="flex gap-3">

                            <button
                              onClick={() => editCategory(cat)}
                              className="text-blue-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteCategory(cat.id)}
                              className="text-red-500"
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                        {/* SUB CATEGORIES */}
                        <div className="ml-8 mt-3 space-y-2">

                          {categories
                            .filter(sub => sub.parent_id === cat.id)
                            .map(sub => (

                              <div
                                key={sub.id}
                                className="text-sm text-gray-600 border-l pl-4"
                              >
                                └ {sub.name_en} ({sub.name_ar})
                              </div>

                            ))
                          }

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

      </div>

    </div>
  );
}