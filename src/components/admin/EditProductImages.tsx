"use client"

import { useState } from "react"

export default function EditProductImages({ images }: { images: string[] }) {
  const [orderedImages, setOrderedImages] = useState<string[]>(images || [])
  const [deleted, setDeleted] = useState<string[]>([])

  const toggleDelete = (img: string) => {
    if (deleted.includes(img)) {
      setDeleted(deleted.filter((i) => i !== img))
    } else {
      setDeleted([...deleted, img])
    }
  }

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...orderedImages]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newImages.length) return

    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp

    setOrderedImages(newImages)
  }

  return (
    <div>
      <label className="font-semibold">Product Images</label>

      <div className="flex gap-3 flex-wrap mt-2">
        {orderedImages.map((img, index) => (
          <div key={img} className="relative border rounded p-2 bg-white">
            <img
              src={img}
              className={`w-24 h-24 object-cover rounded border ${
                deleted.includes(img) ? "opacity-40" : ""
              }`}
            />

            <button
              type="button"
              onClick={() => toggleDelete(img)}
              className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs"
            >
              ✕
            </button>

            <div className="flex justify-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => moveImage(index, "up")}
                disabled={index === 0}
                className="px-2 py-1 text-xs border rounded disabled:opacity-30"
              >
                ↑
              </button>

              <button
                type="button"
                onClick={() => moveImage(index, "down")}
                disabled={index === orderedImages.length - 1}
                className="px-2 py-1 text-xs border rounded disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        type="hidden"
        name="image_order"
        value={JSON.stringify(orderedImages)}
      />

{/* Hidden inputs */}
{deleted.map((img) => (
  <input
    key={img}
    type="hidden"
    name="delete_images"
    value={img}
  />
))}

{/* Ordered images */}
{orderedImages
  .filter((img) => !deleted.includes(img))
  .map((img) => (
    <input
      key={img}
      type="hidden"
      name="ordered_images"
      value={img}
    />
  ))}

<input
  type="file"
  name="images"
  multiple
  className="mt-3"
/>
    </div>
  )
}