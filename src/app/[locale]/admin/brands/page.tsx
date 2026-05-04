"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

export default function BrandsPage() {

  const supabase = createClient();

  const [brands, setBrands] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState(""); // ✅ NEW
  const [image, setImage] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBrands = async () => {
    const { data } = await supabase
      .from("brands")
      .select("*")
      .order("sort_order");

    setBrands(data || []);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  /* ================= IMAGE ================= */

  const uploadImage = async () => {

    if (!image) return null;

    const fileName = `${Date.now()}-${image.name}`;

    const { error } = await supabase.storage
      .from("brands")
      .upload(fileName, image);

    if (error) {
      console.error(error);
      return null;
    }

    const { data } = supabase.storage
      .from("brands")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  /* ================= ADD ================= */

  const addBrand = async () => {

    const imageUrl = await uploadImage();

    await supabase.from("brands").insert({
      name,
      name_ar: nameAr || name, // ✅ fallback
      image: imageUrl,
      slug: name.toLowerCase().replace(/\s+/g, "-")
    });

    resetForm();
    fetchBrands();
  };

  /* ================= UPDATE ================= */

  const updateBrand = async () => {

    let imageUrl = null;

    if (image) {
      imageUrl = await uploadImage();
    }

    const updateData: any = {
      name,
      name_ar: nameAr || name // ✅ fallback
    };

    if (imageUrl) {
      updateData.image = imageUrl;
    }

    await supabase
      .from("brands")
      .update(updateData)
      .eq("id", editingId);

    resetForm();
    fetchBrands();
  };

  /* ================= DELETE ================= */

  const deleteBrand = async (id: string) => {
    await supabase
      .from("brands")
      .delete()
      .eq("id", id);

    fetchBrands();
  };

  /* ================= EDIT ================= */

  const editBrand = (brand: any) => {
    setEditingId(brand.id);
    setName(brand.name);
    setNameAr(brand.name_ar || ""); // ✅ NEW
  };

  /* ================= RESET ================= */

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setNameAr("");
    setImage(null);
  };

  /* ================= DRAG ================= */

  const handleDragEnd = async (result: any) => {

    if (!result.destination) return;

    const items = Array.from(brands);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setBrands(items);

    for (let i = 0; i < items.length; i++) {
      await supabase
        .from("brands")
        .update({ sort_order: i })
        .eq("id", items[i].id);
    }

  };

  /* ================= UI ================= */

  return (

    <div className="admin-panel p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Brands
      </h1>

      {/* ================= FORM ================= */}

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg mb-6">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {editingId ? "Edit Brand" : "Add Brand"}
        </h2>

        <div className="space-y-4">

          {/* ENGLISH */}
          <input
            placeholder="Name English"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg"
          />

          {/* ARABIC */}
          <input
            placeholder="Name Arabic"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg"
          />

          {/* IMAGE */}
          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0])}
          />

          {/* BUTTONS */}
          <div className="flex gap-3">

            <button
              onClick={editingId ? updateBrand : addBrand}
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

      {/* ================= LIST ================= */}

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          All Brands (Drag to reorder)
        </h2>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="brands">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >

                {brands.map((brand, index) => (

                  <Draggable
                    key={brand.id}
                    draggableId={brand.id}
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

                            {brand.image && (
                              <img
                                src={brand.image}
                                className="w-14 h-14 object-contain rounded-lg"
                              />
                            )}

                            <div>
                              <div className="font-semibold">
                                {brand.name}
                              </div>

                              <div className="text-sm text-gray-500">
                                {brand.name_ar}
                              </div>
                            </div>

                          </div>

                          <div className="flex gap-3">

                            <button
                              onClick={() => editBrand(brand)}
                              className="text-blue-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteBrand(brand.id)}
                              className="text-red-500"
                            >
                              Delete
                            </button>

                          </div>

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