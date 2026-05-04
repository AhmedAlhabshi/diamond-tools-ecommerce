"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"
import { Menu, Search, Heart } from "lucide-react"
import Image from "next/image"
import CartIcon from "@/components/CartIcon"
import ProductPrice from "@/components/product-price"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { useCart } from "@/store/useCart"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"

export default function MobileHeader() {

  const locale = useLocale()
  const t = useTranslations("Header")

  const [menuOpen, setMenuOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const [showQuote, setShowQuote] = useState(false)
  const [quoteFile, setQuoteFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false);
const [submitted, setSubmitted] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<any>(null)

  const cartItemsCount = useCart((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  )

  const handleSignOut = async () => {
  const supabase = createClient()
  await supabase.auth.signOut()
  setUser(null)
  window.location.href = `/${locale}/login`
}

  /* ================= Search ================= */
  useEffect(() => {
    const delay = setTimeout(async () => {

      if (!search.trim()) {
        setResults([])
        setShowResults(false)
        return
      }

      const res = await fetch(`/api/search?q=${search}`)
      const data = await res.json()

      setResults(data)
      setShowResults(true)

    }, 250)

    return () => clearTimeout(delay)

  }, [search])

  /* ================= Click Outside ================= */
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!searchRef.current) return
      if (searchRef.current.contains(event.target)) return
      setShowResults(false)
    }

    document.addEventListener("pointerdown", handleClickOutside)
    return () => document.removeEventListener("pointerdown", handleClickOutside)
  }, [])

  useEffect(() => {
  const open = () => setShowQuote(true);
  window.addEventListener("openQuoteModal", open);
  return () => window.removeEventListener("openQuoteModal", open);
}, []);

useEffect(() => {
  const supabase = createClient()

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  // أول تحميل
  loadUser()

  // 🔥 مهم جدًا: التحديث عند الرجوع للصفحة
  window.addEventListener("focus", loadUser)

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
  })

  return () => {
    subscription.unsubscribe()
    window.removeEventListener("focus", loadUser)
  }
}, [])

  return (
    <header className="bg-white shadow-sm relative z-50">

      {/* ================= TOP BAR ================= */}
      <div className="flex items-center justify-between px-4 py-3">

        <button onClick={() => setMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>

        <Link href="/" locale={locale}>
          <Image src="/logo11.png" alt="logo" width={200} height={80} className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/wishlist" locale={locale}>
            <Heart className="w-5 h-5" />
          </Link>
          <CartIcon count={cartItemsCount} />
        </div>

      </div>

      {/* ================= SEARCH ================= */}
      <div className="px-4 pb-3">
        <div ref={searchRef} className="relative">

          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onFocus={() => setShowResults(true)}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border border-gray-200 rounded-full py-2.5 text-sm ${
              locale === "ar"
                ? "pr-10 pl-4 text-right"
                : "pl-10 pr-4"
            }`}
          />

          <Search
            className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              locale === "ar" ? "right-3" : "left-3"
            }`}
          />

          {showResults && (
            <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-xl mt-2 z-[9999] max-h-72 overflow-y-auto">

              {results.length > 0 ? (
                results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.images?.[0] || "/placeholder.png"} className="w-10 h-10 object-contain" />
                      <span className="text-sm font-medium">
                        {locale === "ar" ? item.name_ar : item.name_en}
                      </span>
                    </div>

                    <ProductPrice product={item} variant={item.variant} size="sm" />
                  </Link>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-sm">{t("noResults")}</div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* ================= SIDEBAR ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          <div
            className={`relative w-64 h-full bg-white p-5 flex flex-col gap-4 shadow-xl z-10 ${
              locale === "ar" ? "ml-auto" : ""
            }`}
          >

            <button
              onClick={() => setMenuOpen(false)}
              className={locale === "ar" ? "self-start" : "self-end"}
            >
              ✕
            </button>

<div onClick={() => setMenuOpen(false)} className="flex flex-col gap-4">

  <Link href={{ pathname: "/categories" }}>
    {t("categories")}
  </Link>

  <Link href={{ pathname: "/brands" }}>
    {t("brands")}
  </Link>

  <Link href={{ pathname: "/products" }}>
    {t("products")}
  </Link>

  <Link href={{ pathname: "/about" }}>
    {t("about")}
  </Link>

  <Link href={{ pathname: "/contact" }}>
    {t("contact")}
  </Link>

  <hr />

  <LanguageSwitcher />

{user ? (
  <button
    onClick={() => {
      setMenuOpen(false)
      handleSignOut()
    }}
    className="text-left"
  >
    {t("signOut")}
  </button>
) : (
  <Link href={{ pathname: "/login" }}>
    {t("login")}
  </Link>
)}

</div>
            <button
              onClick={() => {
                setMenuOpen(false)
                setShowQuote(true)
              }}
              className="mt-2 w-full bg-black text-white py-2.5 rounded-lg text-sm font-semibold"
            >
              {t("quote")}
            </button>

          </div>

        </div>
      )}

      {/* ================= QUOTE MODAL ================= */}
{showQuote && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative">

      <button
        onClick={() => {
          setShowQuote(false);
          setSubmitted(false);
        }}
        className={`absolute top-3 ${
          locale === "ar" ? "left-3" : "right-3"
        }`}
      >
        ✕
      </button>

      {/* ✅ SUCCESS STATE */}
      {submitted ? (
        <div className="text-center space-y-4 py-6">

          <h3 className="text-lg font-semibold">
            {t("successTitle")}
          </h3>

          <p className="text-gray-500">
            {t("successDesc")}
          </p>

          <button
            onClick={() => {
              setShowQuote(false);
              setSubmitted(false);
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            {t("close")}
          </button>

        </div>
      ) : (

        <>
          <h2 className="text-xl mb-4">{t("quoteTitle")}</h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              setLoading(true);

              const form = e.currentTarget;
              const formData = new FormData(form);

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
                setQuoteFile(null);
                form.reset();
              } else {
                toast.error(t("error"));
              }
            }}
            className="flex flex-col gap-3"
          >

            <input
              name="name"
              placeholder={t("fullName")}
              required
              minLength={3}
              className="border p-2 rounded"
            />

            <input
              name="company"
              placeholder={t("company")}
              className="border p-2 rounded"
            />

            <input
              name="phone"
              placeholder={t("phone")}
              required
              className="border p-2 rounded"
            />

            <textarea
              name="message"
              placeholder={t("message")}
              className="border p-2 rounded"
            />

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setQuoteFile(e.target.files?.[0] || null)}
              className="border p-2 rounded"
            />

            {/* ✅ File preview */}
            {quoteFile && (
              <p className="text-xs text-gray-500">
                {quoteFile.name}
              </p>
            )}

            <button className="bg-blue-600 text-white py-2 rounded-lg">
              {loading ? t("sending") : t("submit")}
            </button>

          </form>
        </>
      )}

    </div>
  </div>
)}

    </header>
  )
}