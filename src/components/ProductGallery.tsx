"use client"

import { useEffect, useState } from "react"

export default function ProductGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return

    const interval = setInterval(() => {
      setSelected((current) => (current + 1) % images.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [images])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`border rounded-lg overflow-hidden w-16 h-16 transition ${
              selected === i ? "border-blue-500 ring-2 ring-blue-200" : ""
            }`}
          >
            <img
              src={img}
              alt={`Product image ${i + 1}`}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1">
        <div className="border rounded-xl p-4 bg-white">
          <img
            src={images[selected]}
            alt="Product image"
            className="w-full h-[350px] object-contain hover:scale-105 transition duration-500"
          />
        </div>
      </div>
    </div>
  )
}