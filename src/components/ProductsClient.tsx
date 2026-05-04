"use client"

import { useState } from "react"

export default function ProductsClient({ sidebar }: any) {

  const [showFilters, setShowFilters] = useState(false)

  return (
    <>
      {/* 🔥 Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowFilters(true)}
          className="w-full border py-2 rounded-lg text-sm font-semibold"
        >
          Filters
        </button>
      </div>

      {/* 🔥 Filter Modal */}
      {showFilters && (
  <div className="fixed inset-0 z-50">

    {/* 🔥 Overlay */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowFilters(false)}
    />

    {/* 🔥 Sidebar */}
    <div className="relative w-72 bg-white p-5 h-full overflow-y-auto z-10">

      {/* Close button */}
      <button
        onClick={() => setShowFilters(false)}
        className="mb-4"
      >
        ✕
      </button>

      {/* Filters */}
      <div
        onClick={() => setShowFilters(false)}
        className="space-y-6"
      >
        {sidebar}
      </div>

    </div>

  


          {/* Overlay */}
          <div
            className="flex-1"
            onClick={() => setShowFilters(false)}
          />

        </div>
      )}
    </>
  )
}