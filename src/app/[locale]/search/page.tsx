"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import ProductPrice from "@/components/product-price";

export default function SearchPage() {
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setSearch(q);
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(search)}&all=true`
        );
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Search page error:", error);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    window.history.pushState(
      null,
      "",
      `/${locale}/search?q=${encodeURIComponent(search)}`
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">
          {locale === "ar" ? "نتائج البحث" : "Search Results"}
        </h1>

        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "ar" ? "ابحث عن منتج..." : "Search products..."}
            className={`w-full border rounded-lg px-4 py-3 ${
              locale === "ar" ? "text-right" : ""
            }`}
          />

          <button className="bg-blue-600 text-white px-6 rounded-lg font-bold">
            {locale === "ar" ? "بحث" : "Search"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mb-6">
          {loading
            ? locale === "ar"
              ? "جاري البحث..."
              : "Searching..."
            : locale === "ar"
            ? `${results.length} منتج`
            : `${results.length} products found`}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((item) => (
            <Link
              key={item.id}
              href={{ pathname: `/products/${item.id}` }}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  className="w-full h-full object-contain"
                  alt=""
                />
              </div>

              <h2 className="text-sm font-semibold line-clamp-2">
                {locale === "ar" ? item.name_ar : item.name_en}
              </h2>

              <div className="mt-2">
                <ProductPrice product={item} variant={item.variant} size="sm" />
              </div>
            </Link>
          ))}
        </div>

        {!loading && search && results.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500 mt-6">
            {locale === "ar" ? "لا توجد منتجات" : "No products found"}
          </div>
        )}
      </div>
    </main>
  );
}