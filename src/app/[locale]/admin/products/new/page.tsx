"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import RichTextEditor from "@/components/admin/RichTextEditor"

export default function AddProductPage() {
  const supabase = createClient()
  const router = useRouter()

  const [nameAr, setNameAr] = useState("")
  const [nameEn, setNameEn] = useState("")

  const [price, setPrice] = useState("")
  const [discountPrice, setDiscountPrice] = useState("")

  const [descriptionAr, setDescriptionAr] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")

  const [specificationsAr, setSpecificationsAr] = useState("")
  const [specificationsEn, setSpecificationsEn] = useState("")

  const [stock, setStock] = useState("")

  const [featured, setFeatured] = useState(false)
  const [bestSeller, setBestSeller] = useState(false)

  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])

  const [categoryId, setCategoryId] = useState("")
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [subCategoryId, setSubCategoryId] = useState("")
  const [brandId, setBrandId] = useState("")
const [brandIds, setBrandIds] = useState<string[]>([])
const [madeIn, setMadeIn] = useState("")
const [productCode, setProductCode] = useState("")

  const [images, setImages] = useState<File[]>([])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order")

    setCategories(data || [])
  }

  const fetchBrands = async () => {
    const { data } = await supabase
      .from("brands")
      .select("*")
      .order("sort_order")

    setBrands(data || [])
  }

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  const handleCategoryChange = (id: string) => {
    setCategoryId(id)
    setSubCategoryId("")

    const subs = categories.filter((cat: any) => cat.parent_id === id)
    setSubCategories(subs)
  }

  const toggleExtraCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id)
        ? prev.filter((catId) => catId !== id)
        : [...prev, id]
    )
  }

  const toggleExtraBrand = (id: string) => {
  setBrandIds((prev) =>
    prev.includes(id)
      ? prev.filter((brandId) => brandId !== id)
      : [...prev, id]
  )
}

  const uploadImages = async () => {
    if (!images.length) return []

    const urls = []

    for (const image of images) {
      const fileName = `products/${Date.now()}-${Math.random()}-${image.name}`

      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, image)

      if (error) {
        console.error("Image upload error:", error)
        continue
      }

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName)

      urls.push(data.publicUrl)
    }

    return urls
  }

  const handleSubmit = async () => {
    try {
      const imageUrls = await uploadImages()

      const { data, error } = await supabase
        .from("products")
        .insert({
          name_ar: nameAr,
          name_en: nameEn,
          made_in: madeIn,
          product_code: productCode,

          individual_price: price ? Number(price) : null,
          discount_price: discountPrice ? Number(discountPrice) : null,

          description_ar: descriptionAr,
          description_en: descriptionEn,

          specifications_ar: specificationsAr,
          specifications_en: specificationsEn,

          category_id: categoryId || null,
          sub_category_id: subCategoryId || null,
          brand_id: brandId || null,

          stock: stock ? Number(stock) : 0,

          featured: featured,
          best_seller: bestSeller,

          images: imageUrls || [],
        })
        .select()
        .single()

      if (error) {
        console.error("Insert error:", error)
        alert("Error adding product")
        return
      }

      const allCategoryIds = Array.from(
        new Set([
          ...(categoryId ? [categoryId] : []),
          ...categoryIds,
        ])
      )

      if (allCategoryIds.length > 0) {
        const inserts = allCategoryIds.map((catId) => ({
          product_id: data.id,
          category_id: catId,
        }))

        const { error: categoryError } = await supabase
          .from("product_categories")
          .insert(inserts)

        if (categoryError) {
          console.error("Product categories insert error:", categoryError)
        }
      }

      if (brandIds.length > 0) {
  const brandInserts = brandIds.map((brandId) => ({
    product_id: data.id,
    brand_id: brandId,
  }))

  const { error: brandError } = await supabase
    .from("product_brands")
    .insert(brandInserts)

  if (brandError) {
    console.error("Product brands insert error:", brandError)
  }
}

      router.push(`/admin/products/${data.id}/variants`)
    } catch (err) {
      console.error("Unexpected error:", err)
      alert("Something went wrong")
    }
  }

  return (
    <div className="admin-panel p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-4 max-w-2xl">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Name English</label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label>Name Arabic</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
  <label>Made In</label>
  <input
    value={madeIn}
    onChange={(e) => setMadeIn(e.target.value)}
    placeholder="e.g. Austria, Germany, Finland"
    className="w-full border p-2 rounded"
  />
</div>

<div>
  <label>Product Code</label>
  <input
    value={productCode}
    onChange={(e) => setProductCode(e.target.value)}
    placeholder="e.g. TYR-12345"
    className="w-full border p-2 rounded"
  />
</div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label>Discounted Price</label>
            <input
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <select
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Main Category</option>
          {categories
            .filter((cat: any) => !cat.parent_id)
            .map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en}
              </option>
            ))}
        </select>

        <div className="border rounded-lg p-4 bg-slate-50">
          <h3 className="font-semibold mb-3 text-slate-800">
            Additional Categories
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {categories
              .filter((cat: any) => !cat.parent_id)
              .map((cat: any) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(cat.id)}
                    onChange={() => toggleExtraCategory(cat.id)}
                  />
                  {cat.name_en}
                </label>
              ))}
          </div>
        </div>

        <select
          value={subCategoryId}
          onChange={(e) => setSubCategoryId(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Sub Category</option>
          {subCategories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name_en}
            </option>
          ))}
        </select>

        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Brand</option>
          {brands.map((brand: any) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>

        <div className="border rounded-lg p-4 bg-slate-50">
  <h3 className="font-semibold mb-3 text-slate-800">
    Additional Brands
  </h3>

  <div className="grid grid-cols-2 gap-2">
    {brands
      .filter((brand: any) => brand.id !== brandId)
      .map((brand: any) => (
        <label
          key={brand.id}
          className="flex items-center gap-2 text-sm"
        >
          <input
            type="checkbox"
            checked={brandIds.includes(brand.id)}
            onChange={() => toggleExtraBrand(brand.id)}
          />
          {brand.name}
        </label>
      ))}
  </div>
</div>

        <div>
          <label>Description English</label>
          <RichTextEditor
            value={descriptionEn}
            onChange={setDescriptionEn}
            placeholder="Description English"
          />
        </div>

        <div>
          <label>Description Arabic</label>
          <RichTextEditor
            value={descriptionAr}
            onChange={setDescriptionAr}
            placeholder="Description Arabic"
          />
        </div>

        <div>
          <label>Specifications English</label>
          <RichTextEditor
            value={specificationsEn}
            onChange={setSpecificationsEn}
            placeholder="Specifications English"
          />
        </div>

        <div>
          <label>Specifications Arabic</label>
          <RichTextEditor
            value={specificationsAr}
            onChange={setSpecificationsAr}
            placeholder="Specifications Arabic"
          />
        </div>

        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="file"
          multiple
          onChange={(e) =>
            setImages((prev) => [
              ...prev,
              ...Array.from(e.target.files || [])
            ])
          }
        />

        <div className="flex gap-2 flex-wrap mt-3">
          {images.map((file, index) => (
            <img
              key={index}
              src={URL.createObjectURL(file)}
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <label>Featured Product</label>
        </div>

        <div className="flex gap-2">
          <input
            type="checkbox"
            checked={bestSeller}
            onChange={(e) => setBestSeller(e.target.checked)}
          />
          <label>Best Seller</label>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Save Product
        </button>

      </div>
    </div>
  )
}