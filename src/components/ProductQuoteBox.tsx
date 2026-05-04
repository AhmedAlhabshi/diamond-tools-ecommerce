"use client";

export default function ProductQuoteBox({
  locale,
}: {
  locale: string;
}) {
  const isArabic = locale === "ar";

  return (
    <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-medium text-slate-800">
        {isArabic
          ? "هل تبحث عن مواصفات أو مقاسات مختلفة؟"
          : "Looking for different features or sizes?"}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {isArabic
          ? "اطلب عرض سعر وسنوفر لك الحل الأنسب لاحتياجاتك."
          : "Request a quote and we’ll provide the best solution for your needs."}
      </p>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-quote-modal"))}
        className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        {isArabic ? "اطلب عرض سعر" : "Request a Quote"}
      </button>
    </div>
  );
}