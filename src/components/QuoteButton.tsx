'use client'

export default function QuoteButton({ label }: { label: string }) {

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("openQuoteModal"))}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      {label}
    </button>
  )
}