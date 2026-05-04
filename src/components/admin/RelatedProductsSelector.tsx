"use client";

import { useState, useEffect } from "react";

export default function RelatedProductsSelector({
  allProducts,
  defaultSelected
}: any) {

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any[]>([]);

  // 🔥 FIX: تحديث القيم عند التحميل
  useEffect(() => {
    setSelected(defaultSelected || []);
  }, [defaultSelected]);

  const filtered = allProducts.filter((p: any) =>
    p.name_en.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProduct = (product: any) => {

    const exists = selected.find((p: any) => p.id === product.id);

    if (exists) {
      setSelected(selected.filter((p: any) => p.id !== product.id));
    } else {
      setSelected([...selected, product]);
    }
  };

  return (
    <div className="space-y-4">

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-2 rounded"
      />

      {/* ✅ SELECTED */}
      <div className="flex flex-wrap gap-2">
        {selected.map((p: any) => (
          <div
            key={p.id}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded flex items-center gap-2"
          >
            {p.name_en}

            <button
              type="button"
              onClick={() =>
                setSelected(selected.filter((s: any) => s.id !== p.id))
              }
              className="text-red-500"
            >
              ✕
            </button>

            {/* 🔥 IMPORTANT */}
<input
  type="checkbox"
  name="related_products"
  value={p.id}
  checked
  readOnly
  className="hidden"
/>
          </div>
        ))}
      </div>

      {/* 📦 RESULTS */}
      <div className="max-h-40 overflow-y-auto border rounded">

        {filtered.map((p: any) => {

          const isSelected = selected.find((s: any) => s.id === p.id);

          return (
            <div
              key={p.id}
              onClick={() => toggleProduct(p)}
              className={`p-2 cursor-pointer border-b hover:bg-gray-100 ${
                isSelected ? "bg-blue-50" : ""
              }`}
            >
              {p.name_en}
            </div>
          );
        })}

      </div>

    </div>
  );
}