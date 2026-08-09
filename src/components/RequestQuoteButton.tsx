"use client"

export default function RequestQuoteButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-quote-modal"))}
      className={`rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition ${className}`}
    >
      Request Quote
    </button>
  )
}