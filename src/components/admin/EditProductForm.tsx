"use client"

import { useState, useEffect } from "react"
import RichTextEditor from "@/components/admin/RichTextEditor"
import EditProductImages from "@/components/admin/EditProductImages"
import RelatedProductsSelector from "@/components/admin/RelatedProductsSelector"
import { updateProduct } from "@/app/actions/products"
import { addProductDownload, deleteProductDownload } from "@/app/actions/products"

export default function EditProductForm({
  product,
  categories,
  brands,
  allProducts,
  relatedIds,
selectedCategoryIds = [],
selectedBrandIds = [],
}: any) {
  const [descriptionEn, setDescriptionEn] = useState(product.description_en || "")
  const [descriptionAr, setDescriptionAr] = useState(product.description_ar || "")
  const [specificationsEn, setSpecificationsEn] = useState(product.specifications_en || "")
  const [specificationsAr, setSpecificationsAr] = useState(product.specifications_ar || "")
  const [downloads, setDownloads] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/downloads?product_id=${product.id}`)
      const data = await res.json()
      setDownloads(data || [])
    }

    load()
  }, [product.id])

  return (
    <form action={updateProduct} className="bg-white p-6 rounded-lg shadow space-y-4">
      <input type="hidden" name="id" value={product.id} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Name English</label>
          <input name="name_en" defaultValue={product.name_en} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Name Arabic</label>
          <input name="name_ar" defaultValue={product.name_ar} className="w-full border p-2 rounded" />
        </div>
      </div>

      <div>
  <label>Made In</label>
  <input
    name="made_in"
    defaultValue={product.made_in || ""}
    placeholder="e.g. Austria, Germany, Finland"
    className="w-full border p-2 rounded"
  />
</div>

<div>
  <label>Product Code</label>
  <input
    name="product_code"
    defaultValue={product.product_code || ""}
    placeholder="e.g. TYR-12345"
    className="w-full border p-2 rounded"
  />
</div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Price</label>
          <input name="individual_price" defaultValue={product.individual_price} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Discounted Price</label>
          <input name="discount_price" defaultValue={product.discount_price} className="w-full border p-2 rounded" />
        </div>
      </div>

      <div>
        <label>Main Category</label>
        <select name="category_id" defaultValue={product.category_id || ""} className="w-full border p-2 rounded">
          <option value="">Select Main Category</option>
          {categories
            ?.filter((cat: any) => !cat.parent_id)
            .map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en}
              </option>
            ))}
        </select>
      </div>

      <div className="border rounded-lg p-4 bg-slate-50">
        <h3 className="font-semibold mb-3 text-slate-800">
          Additional Categories
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {categories
            ?.filter((cat: any) => !cat.parent_id)
            .map((cat: any) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="category_ids"
                  value={cat.id}
                  defaultChecked={selectedCategoryIds.includes(String(cat.id))}
                />
                {cat.name_en}
              </label>
            ))}
        </div>
      </div>

<div>
  <label>Main Brand</label>

  <select
    name="brand_id"
    defaultValue={product.brand_id || ""}
    className="w-full border p-2 rounded"
  >
    <option value="">Select Brand</option>

    {brands?.map((brand: any) => (
      <option key={brand.id} value={brand.id}>
        {brand.name}
      </option>
    ))}
  </select>
</div>

<div className="border rounded-lg p-4 bg-slate-50">
  <h3 className="font-semibold mb-3 text-slate-800">
    Additional Brands
  </h3>

  <div className="grid grid-cols-2 gap-2">
    {brands
      ?.filter((brand: any) => brand.id !== product.brand_id)
      .map((brand: any) => (
        <label
          key={brand.id}
          className="flex items-center gap-2 text-sm"
        >
          <input
            type="checkbox"
            name="brand_ids"
            value={brand.id}
            defaultChecked={selectedBrandIds.includes(String(brand.id))}
          />

          {brand.name}
        </label>
      ))}
  </div>
</div>



      <div>
        <label>Stock</label>
        <input name="stock" defaultValue={product.stock} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Description English</label>
        <RichTextEditor value={descriptionEn} onChange={setDescriptionEn} placeholder="Description English" dir="ltr" />
        <input type="hidden" name="description_en" value={descriptionEn} />
      </div>

      <div>
        <label>Description Arabic</label>
        <RichTextEditor value={descriptionAr} onChange={setDescriptionAr} placeholder="Description Arabic" dir="rtl" />
        <input type="hidden" name="description_ar" value={descriptionAr} />
      </div>

      <div>
        <label>Specifications English</label>
        <RichTextEditor value={specificationsEn} onChange={setSpecificationsEn} placeholder="Specifications English" dir="ltr" />
        <input type="hidden" name="specifications_en" value={specificationsEn} />
      </div>

      <div>
        <label>Specifications Arabic</label>
        <RichTextEditor value={specificationsAr} onChange={setSpecificationsAr} placeholder="Specifications Arabic" dir="rtl" />
        <input type="hidden" name="specifications_ar" value={specificationsAr} />
      </div>

      <EditProductImages images={product.images || []} />

      <div className="flex items-center gap-2">
        <input type="checkbox" name="featured" defaultChecked={product.featured} />
        <label>Featured Product</label>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="best_seller" defaultChecked={product.best_seller} />
        <label>Best Seller</label>
      </div>

      <div>
        <label className="block mb-2 font-semibold">Related Products</label>
        <RelatedProductsSelector
          allProducts={allProducts}
          defaultSelected={allProducts?.filter((p: any) =>
            relatedIds.includes(String(p.id))
          )}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-3">Downloads (PDF)</h3>

        <div className="flex gap-3 items-center mb-4">
          <input type="hidden" name="product_id" value={product.id} />

          <input id="title_en" name="title_en" placeholder="File name (English)" className="border p-2 rounded w-1/3" />
          <input id="title_ar" name="title_ar" placeholder="File name (Arabic)" className="border p-2 rounded w-1/3" />
          <input id="file" type="file" name="file" accept="application/pdf" className="border p-2 rounded" />

          <button
            type="button"
            onClick={async () => {
              const formData = new FormData()

              formData.append("product_id", product.id)
              formData.append("title_en", (document.getElementById("title_en") as HTMLInputElement).value)
              formData.append("title_ar", (document.getElementById("title_ar") as HTMLInputElement).value)

              const fileInput = document.getElementById("file") as HTMLInputElement

              if (fileInput.files?.[0]) {
                formData.append("file", fileInput.files[0])
              }

              await addProductDownload(formData)
              location.reload()
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Upload
          </button>
        </div>

        <div className="space-y-2">
          {downloads.map((file) => (
            <div key={file.id} className="flex items-center justify-between border p-2 rounded">
              <a href={file.file_url} target="_blank" className="text-blue-600 hover:underline">
                {file.title_en}
              </a>

              <button
                type="button"
                onClick={async () => {
                  await deleteProductDownload(file.id, file.file_path)
                  setDownloads(downloads.filter((d) => d.id !== file.id))
                }}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Update Product
      </button>
    </form>
  )
}