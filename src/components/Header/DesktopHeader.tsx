"use client";

import { useEffect, useState, useRef } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { User, Search, Heart, X } from "lucide-react";
import { useCart } from "@/store/useCart";
import Image from "next/image";
import CartIcon from "@/components/CartIcon";
import ProductPrice from "@/components/product-price";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "@/i18n/routing";

export default function DesktopHeader() {
  const t = useTranslations("Header");
  const currentLocale = useLocale();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showTop, setShowTop] = useState(true);

  const [showQuote, setShowQuote] = useState(false);
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = useCart((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY <= 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }

      try {
        const res = await fetch(`/api/search?q=${search}`);
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const openQuote = () => {
      setShowQuote(true);
      setSubmitted(false);
    };

    window.addEventListener("open-quote-modal", openQuote);

    return () => {
      window.removeEventListener("open-quote-modal", openQuote);
    };
  }, []);

  return (
    <header className="bg-white relative z-50">
      {/* ================= TOP UTILITY BAR ================= */}
      <div
        className={`bg-gray-50 border-b border-gray-100 transition-all duration-300 overflow-hidden ${
          showTop ? "max-h-12 py-2" : "max-h-0 py-0 border-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-gray-600">
          <div className="flex items-center gap-6">
            <Link
              href={{ pathname: user ? "/dashboard" : "/login" }}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{user ? t("account") : t("login")}</span>
            </Link>

            <Link
              href={{ pathname: "/wishlist" }}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{t("wishlist")}</span>
            </Link>

            <button
              onClick={() => setShowQuote(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-[11px] font-bold hover:bg-blue-700 transition-all shadow-sm"
            >
              {t("quote")}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] text-gray-600 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <span className="text-sm">🔒</span>
              {t("topbar.secure")}
            </span>

            <span className="flex items-center gap-1.5">
              <span className="text-sm">🚚</span>
              {t("topbar.delivery")}
            </span>

            <span className="flex items-center gap-1.5">
              <span className="text-sm">🏬</span>
              {t("topbar.pickup")}
            </span>
          </div>

          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-10">
          {/* LOGO */}
          <div className="flex-shrink-0 min-w-[260px]">
            <Link href={{ pathname: "/" }}>
              <div className="h-[90px] flex items-center overflow-hidden">
                <Image
                  src={currentLocale === "ar" ? "/logo-ar1.png" : "/logo11.png"}
                  alt="Diamond Industrial Tools"
                  width={500}
                  height={120}
                  className={`w-auto object-contain ${
                    currentLocale === "ar" ? "h-[50px]" : "h-[90px]"
                  }`}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* SEARCH */}
          <div ref={searchRef} className="flex-grow max-w-2xl relative">
            <div className="relative group">
              <input
                type="text"
                placeholder={t("search") || "Search tools..."}
                value={search}
                onFocus={() => setShowResults(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowResults(true);
                }}
                className={`w-full bg-gray-100 border-transparent border focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-full py-2.5 transition-all outline-none text-sm ${
                  currentLocale === "ar"
                    ? "pr-12 pl-5 text-right"
                    : "pl-12 pr-5"
                }`}
              />

              <Search
                className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors ${
                  currentLocale === "ar" ? "right-4" : "left-4"
                }`}
              />
            </div>

            {showResults && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl mt-3 z-[100] overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
{results.length > 0 ? (
  <>
    {results.map((item) => (
      <Link
        key={item.id}
        href={{ pathname: `/products/${item.id}` }}
        onClick={() => setShowResults(false)}
        className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-none"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center p-1">
            <img
              src={item.images?.[0] || "/placeholder.png"}
              className="w-full h-full object-contain"
              alt=""
            />
          </div>

          <span className="text-sm font-semibold text-gray-800">
            {currentLocale === "ar" ? item.name_ar : item.name_en}
          </span>
        </div>

        <ProductPrice
          product={item}
          variant={item.variant}
          size="sm"
        />
      </Link>
    ))}

    {search.trim() && (
      <Link
        href={{
          pathname: `/search`,
          query: { q: search.trim() },
        }}
        onClick={() => setShowResults(false)}
        className="block px-5 py-4 text-center text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
      >
        {currentLocale === "ar"
          ? "عرض كل المنتجات"
          : "See all products"}
      </Link>
    )}
  </>
) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 text-sm">
                        {search ? t("noResults") : "Start typing to search..."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CART */}
          <div className="flex-shrink-0 flex items-center">
            <CartIcon count={cartItemsCount} />
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-10 py-3.5">
            {[
              { name: t("categories"), path: "/categories" },
              { name: t("brands"), path: "/brands" },
              { name: t("products"), path: "/products" },
              { name: t("about"), path: "/about" },
              { name: t("contact"), path: "/contact" },
            ].map((link) => (
              <Link
                key={link.path}
                href={{ pathname: link.path }}
                className="text-[13px] font-bold text-gray-700 hover:text-blue-600 transition-all relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ================= QUOTE MODAL ================= */}
      {showQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
            <button
              onClick={() => {
                setShowQuote(false);
                setSubmitted(false);
              }}
              className={`absolute top-5 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors ${
                currentLocale === "ar" ? "left-5" : "right-5"
              }`}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="p-8">
              {submitted ? (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">
                    {t("successTitle")}
                  </h3>

                  <button
                    onClick={() => setShowQuote(false)}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
                  >
                    {t("close")}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t("quoteTitle")}
                  </h2>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);

                      const formData = new FormData(e.currentTarget);

                      if (quoteFile) {
                        formData.append("file", quoteFile);
                      }

                      const res = await fetch("/api/quote", {
                        method: "POST",
                        body: formData,
                      });

                      setLoading(false);

                      if (res.ok) {
                        setSubmitted(true);
                      } else {
                        toast.error(t("error"));
                      }
                    }}
                    className="space-y-4"
                  >
                    <input
                      name="name"
                      placeholder={t("fullName")}
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                    />

                    <input
                      name="phone"
                      placeholder={t("phone")}
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                    />

                    <textarea
                      name="message"
                      placeholder={t("message")}
                      rows={3}
                      className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 resize-none"
                    />

                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setQuoteFile(e.target.files?.[0] || null)
                      }
                      className="w-full text-xs"
                    />

                    <button
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                      {loading ? t("sending") : t("submit")}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
