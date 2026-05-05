"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ProductVariantsPage() {
  const params = useParams()
  const productId = Array.isArray(params.id) ? params.id[0] : params.id

  const supabase = createClient()

  const [diameter, setDiameter] = useState("")
  const [holeSize, setHoleSize] = useState("")
  const [grit, setGrit] = useState("")
  const [thickness, setThickness] = useState("")
  const [length, setLength] = useState("")
  const [machine, setMachine] = useState("")
  const [stand, setStand] = useState("") 
  const [materialNameEn, setMaterialNameEn] = useState("")
  const [materialNameAr, setMaterialNameAr] = useState("")
  const [materialIconFile, setMaterialIconFile] = useState<File | null>(null)
  const [materialIconUrl, setMaterialIconUrl] = useState("")
  const [removeMaterialIcon, setRemoveMaterialIcon] = useState(false)
  const [descriptionEn, setDescriptionEn] = useState("")
  const [descriptionAr, setDescriptionAr] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")

  const [variants, setVariants] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setDiameter("")
    setHoleSize("")
    setGrit("")
    setThickness("")
    setLength("")
    setMachine("")
    setStand("") 
    setMaterialNameEn("")
    setMaterialNameAr("")
    setMaterialIconFile(null)
    setMaterialIconUrl("")
    setRemoveMaterialIcon(false)
    setDescriptionEn("")
    setDescriptionAr("")
    setPrice("")
    setStock("")
    setEditingId(null)
  }

  const fetchVariants = async () => {
    if (!productId) return

    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setVariants(data || [])
  }

  useEffect(() => {
    fetchVariants()
  }, [productId])

  const handleAddVariant = async () => {
    if (loading) return

    if (!price) {
      alert("Price is required")
      return
    }

    setLoading(true)

    let finalMaterialIconUrl = removeMaterialIcon ? "" : materialIconUrl

    if (materialIconFile) {
      const fileExt = materialIconFile.name.split(".").pop()
      const fileName = `variant-material-icons/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, materialIconFile)

      if (uploadError) {
        console.error(uploadError)
        alert("Error uploading material icon")
        setLoading(false)
        return
      }

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName)

      finalMaterialIconUrl = data.publicUrl
    }

    const payload = {
      diameter,
      hole_size: holeSize,
      grit,
      thickness,
      length,
      machine,
      stand,
      material_name_en: materialNameEn,
      material_name_ar: materialNameAr,
      material_icon_url: finalMaterialIconUrl,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      price: Number(price),
      stock: stock ? Number(stock) : 0,
    }

    let error

    if (editingId) {
      const res = await supabase
        .from("product_variants")
        .update(payload)
        .eq("id", editingId)

      error = res.error
    } else {
      const res = await supabase
        .from("product_variants")
        .insert({
          product_id: productId,
          ...payload,
        })

      error = res.error
    }

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Error saving variant")
      return
    }

    await fetchVariants()
    resetForm()

    alert(editingId ? "Variant updated" : "Variant added")
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      alert("Error deleting variant")
      return
    }

    await fetchVariants()
  }

  const clearMaterial = () => {
    setMaterialNameEn("")
    setMaterialNameAr("")
    setMaterialIconFile(null)
    setMaterialIconUrl("")
    setRemoveMaterialIcon(true)
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Manage Variants</h1>

      <p className="text-sm text-gray-500 mb-6">
        Product ID: {productId}
      </p>

      <div className="bg-white p-6 rounded-lg shadow max-w-xl space-y-4">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Variant" : "Add Variant"}
        </h2>

        <input
          placeholder="Diameter (e.g. 4 inch)"
          value={diameter}
          onChange={(e) => setDiameter(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Hole Size (e.g. 16mm)"
          value={holeSize}
          onChange={(e) => setHoleSize(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Grit (e.g. 60)"
          value={grit}
          onChange={(e) => setGrit(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Thickness (e.g. 2mm)"
          value={thickness}
          onChange={(e) => setThickness(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Length (e.g. 300mm)"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Machine (e.g. FRT950 or Bosch)"
          value={machine}
          onChange={(e) => setMachine(e.target.value)}
          className="w-full border p-2 rounded"
        />

          <input
          placeholder="Stand (e.g. With Stand / Without Stand)"
          value={stand}
          onChange={(e) => setStand(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Material</h3>

          <input
            placeholder="Material Name English (e.g. Steel / 2in1 / Premium)"
            value={materialNameEn}
            onChange={(e) => setMaterialNameEn(e.target.value)}
            className="w-full border p-2 rounded bg-white"
          />

          <input
            placeholder="Material Name Arabic (e.g. فولاذ / ٢ في ١ / ممتاز)"
            value={materialNameAr}
            onChange={(e) => setMaterialNameAr(e.target.value)}
            className="w-full border p-2 rounded bg-white text-right"
            dir="rtl"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Icon
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setMaterialIconFile(file)
                setMaterialIconUrl(URL.createObjectURL(file))
                setRemoveMaterialIcon(false)
              }}
              className="w-full border p-2 rounded bg-white"
            />

            {materialIconUrl && !removeMaterialIcon && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={materialIconUrl}
                  alt="Material icon"
                  className="w-12 h-12 object-contain border rounded p-1 bg-white"
                />

                <button
                  type="button"
                  onClick={() => {
                    setMaterialIconFile(null)
                    setMaterialIconUrl("")
                    setRemoveMaterialIcon(true)
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete Icon
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={clearMaterial}
            className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Clear Material
          </button>
        </div>

        <textarea
          placeholder="Variant Description English"
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
          className="w-full border p-2 rounded min-h-[90px]"
        />

        <textarea
          placeholder="Variant Description Arabic"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          className="w-full border p-2 rounded min-h-[90px] text-right"
          dir="rtl"
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex gap-3">
          <button
            onClick={handleAddVariant}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editingId
                ? "Update Variant"
                : "Add Variant"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">
          Variants List ({variants.length})
        </h2>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Material</th>
                <th className="p-3 text-left">Diameter</th>
                <th className="p-3 text-left">Hole Size</th>
                <th className="p-3 text-left">Grit</th>
                <th className="p-3 text-left">Thickness</th>
                <th className="p-3 text-left">Length</th>
                <th className="p-3 text-left">Machine</th>
                <th className="p-3 text-left">Stand</th>
                <th className="p-3 text-left">Description EN</th>
                <th className="p-3 text-left">Description AR</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3">
                    {(v.material_name_en || v.material_icon_url) ? (
                      <div className="flex items-center gap-2">
                        {v.material_icon_url && (
                          <img
                            src={v.material_icon_url}
                            alt="Material icon"
                            className="w-8 h-8 object-contain"
                          />
                        )}

                        <div>
                          <div>{v.material_name_en || "-"}</div>
                          <div className="text-xs text-gray-500" dir="rtl">
                            {v.material_name_ar || ""}
                          </div>
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-3">{v.diameter || "-"}</td>
                  <td className="p-3">{v.hole_size || "-"}</td>
                  <td className="p-3">{v.grit || "-"}</td>
                  <td className="p-3">{v.thickness || "-"}</td>
                  <td className="p-3">{v.length || "-"}</td>
                  <td className="p-3">{v.machine || "-"}</td>
                  <td className="p-3">{v.stand || "-"}</td>
                  <td className="p-3 max-w-[180px] truncate">{v.description_en || "-"}</td>
                  <td className="p-3 max-w-[180px] truncate text-right" dir="rtl">{v.description_ar || "-"}</td>
                  <td className="p-3">SAR {Number(v.price || 0).toFixed(2)}</td>
                  <td className="p-3">{v.stock ?? 0}</td>

                  <td className="p-3">
                    <button
                      onClick={() => {
                        setEditingId(v.id)
                        setDiameter(v.diameter || "")
                        setHoleSize(v.hole_size || "")
                        setGrit(v.grit || "")
                        setThickness(v.thickness || "")
                        setLength(v.length || "")
                        setMachine(v.machine || "")
                        setStand(v.stand || "")
                        setMaterialNameEn(v.material_name_en || "")
                        setMaterialNameAr(v.material_name_ar || "")
                        setMaterialIconUrl(v.material_icon_url || "")
                        setMaterialIconFile(null)
                        setRemoveMaterialIcon(false)
                        setDescriptionEn(v.description_en || "")
                        setDescriptionAr(v.description_ar || "")
                        setPrice(String(v.price || ""))
                        setStock(String(v.stock || ""))
                      }}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {variants.length === 0 && (
                <tr>
                  <td colSpan={12} className="p-4 text-center text-gray-500">
                    No variants yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}