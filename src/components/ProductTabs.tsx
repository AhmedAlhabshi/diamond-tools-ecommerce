"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ProductTabs({
  description,
  specifications,
  downloads = [],
}: {
  description: string;
  specifications: string;
  downloads?: any[];
}) {
  const t = useTranslations("Product");
  const locale = useLocale();

  const isArabic = locale === "ar";

  const hasDescription = description && description.trim() !== "";
  const hasSpecifications = specifications && specifications.trim() !== "";
  const hasDownloads = downloads && downloads.length > 0;

  // 🔥 إذا مافي شيء لا تعرض القسم
  if (!hasDescription && !hasSpecifications && !hasDownloads) {
    return null;
  }

  const [active, setActive] = useState(
    hasDescription
      ? "description"
      : hasSpecifications
      ? "specifications"
      : "downloads"
  );

  return (
    <div className="mt-16">
      {/* Tabs */}
      <div className="border-b mb-6">
        <div
          className={`flex gap-8 font-semibold ${
            isArabic ? "justify-end" : "justify-start"
          }`}
        >
          {/* Description */}
          {hasDescription && (
            <button
              onClick={() => setActive("description")}
              className={`pb-2 border-b-2 ${
                active === "description"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600"
              }`}
            >
              {t("description")}
            </button>
          )}

          {/* Specifications */}
          {hasSpecifications && (
            <button
              onClick={() => setActive("specifications")}
              className={`pb-2 border-b-2 ${
                active === "specifications"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600"
              }`}
            >
              {t("specifications")}
            </button>
          )}

          {/* Downloads */}
          {hasDownloads && (
            <button
              onClick={() => setActive("downloads")}
              className={`pb-2 border-b-2 ${
                active === "downloads"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600"
              }`}
            >
              {t("downloads")}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {active === "description" && hasDescription && (
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className={`rich-text-content max-w-none text-sm sm:text-base leading-7 text-slate-800 ${
            isArabic ? "text-right" : "text-left"
          }`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      {/* Specifications */}
      {active === "specifications" && hasSpecifications && (
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className={`rich-text-content max-w-none text-sm sm:text-base leading-7 text-slate-800 ${
            isArabic ? "text-right" : "text-left"
          }`}
          dangerouslySetInnerHTML={{ __html: specifications }}
        />
      )}

      {/* Downloads */}
      {active === "downloads" && hasDownloads && (
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className={`grid gap-3 ${isArabic ? "text-right" : "text-left"}`}
        >
          {downloads.map((file: any) => (
            <a
              key={file.id}
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {isArabic
                    ? file.title_ar || file.title_en
                    : file.title_en}
                </p>

                <p className="text-sm text-slate-500">PDF</p>
              </div>

              <span className="text-blue-600 font-semibold">
                {isArabic ? "فتح الملف" : "Open File"}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}