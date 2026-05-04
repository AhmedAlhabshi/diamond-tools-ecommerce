'use client'

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function PDFViewer() {

  const searchParams = useSearchParams()
  const url = searchParams.get("url")

  useEffect(() => {
    if (url) {
      window.location.href = url
    }
  }, [url])

  return (
    <div className="flex items-center justify-center h-screen">
      Loading PDF...
    </div>
  )
}