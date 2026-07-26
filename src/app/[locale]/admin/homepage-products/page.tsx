import {
  addHomepageProduct,
  removeHomepageProduct,
  updateHomepageProductsOrder,
} from "@/app/actions/homepage-products"
import { createClient } from "@/utils/supabase/server"

type Section = "featured" | "best_seller"

type SearchParams = {
  section?: Section
  q?: string
}

function getSectionData(section: Section) {
  if (section === "featured") {
    return {
      title: "Featured Products",
      flagColumn: "featured",
      orderColumn: "featured_sort_order",
    }
  }

  return {
    title: "Best Sellers",
    flagColumn: "best_seller",
    orderColumn: "best_seller_sort_order",
  }
}

export default async function HomepageProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const sp = await searchParams

  const section: Section =
    sp.section === "best_seller" ? "best_seller" : "featured"

  const q = sp.q || ""
  const sectionData = getSectionData(section)

  const supabase = await createClient()

  const { data: currentProducts } = await supabase
    .from("products")
    .select(`
      id,
      name_en,
      name_ar,
      images,
      individual_price,
      featured,
      best_seller,
      featured_sort_order,
      best_seller_sort_order
    `)
    .eq(sectionData.flagColumn, true)
    .order(sectionData.orderColumn, { ascending: true })

  let productsQuery = supabase
    .from("products")
    .select(`
      id,
      name_en,
      name_ar,
      images,
      individual_price,
      featured,
      best_seller
    `)
    .eq("is_active", true)
    .limit(30)

  if (q) {
    productsQuery = productsQuery.or(
      `name_en.ilike.%${q}%,name_ar.ilike.%${q}%`
    )
  }

  const { data: allProducts } = await productsQuery

  const currentIds = currentProducts?.map((p) => p.id).join(",") || ""

  async function addProduct(formData: FormData) {
    "use server"

    const productId = String(formData.get("productId"))
    const section = String(formData.get("section")) as Section

    await addHomepageProduct(section, productId)
  }

  async function removeProduct(formData: FormData) {
    "use server"

    const productId = String(formData.get("productId"))
    const section = String(formData.get("section")) as Section

    await removeHomepageProduct(section, productId)
  }

  async function moveProduct(formData: FormData) {
    "use server"

    const section = String(formData.get("section")) as Section
    const direction = String(formData.get("direction"))
    const currentIndex = Number(formData.get("currentIndex"))
    const ids = String(formData.get("ids")).split(",").filter(Boolean)

    const newIds = [...ids]

    if (direction === "up" && currentIndex > 0) {
      ;[newIds[currentIndex - 1], newIds[currentIndex]] = [
        newIds[currentIndex],
        newIds[currentIndex - 1],
      ]
    }

    if (direction === "down" && currentIndex < newIds.length - 1) {
      ;[newIds[currentIndex + 1], newIds[currentIndex]] = [
        newIds[currentIndex],
        newIds[currentIndex + 1],
      ]
    }

    await updateHomepageProductsOrder(section, newIds)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Homepage Products
        </h1>
        <p className="mt-2 text-slate-600">
          Manage Featured Products and Best Sellers.
        </p>
      </div>

      <div className="flex gap-3">
        <a
          href={`/${locale}/admin/homepage-products?section=featured`}
          className={`rounded-lg px-4 py-2 font-medium ${
            section === "featured"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Featured Products
        </a>

        <a
          href={`/${locale}/admin/homepage-products?section=best_seller`}
          className={`rounded-lg px-4 py-2 font-medium ${
            section === "best_seller"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Best Sellers
        </a>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Current {sectionData.title}
        </h2>

        <div className="space-y-3">
          {currentProducts && currentProducts.length > 0 ? (
            currentProducts.map((product: any, index: number) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name_en || "Product"}
                    className="h-14 w-14 rounded object-cover"
                  />

                  <div>
                    <p className="font-medium text-slate-900">
                      {product.name_en}
                    </p>
                    <p className="text-sm text-slate-500">
                      {product.name_ar}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <form action={moveProduct}>
                    <input type="hidden" name="section" value={section} />
                    <input type="hidden" name="direction" value="up" />
                    <input type="hidden" name="currentIndex" value={index} />
                    <input type="hidden" name="ids" value={currentIds} />

                    <button
                      disabled={index === 0}
                      className="rounded bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Up
                    </button>
                  </form>

                  <form action={moveProduct}>
                    <input type="hidden" name="section" value={section} />
                    <input type="hidden" name="direction" value="down" />
                    <input type="hidden" name="currentIndex" value={index} />
                    <input type="hidden" name="ids" value={currentIds} />

                    <button
                      disabled={index === currentProducts.length - 1}
                      className="rounded bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Down
                    </button>
                  </form>

                  <form action={removeProduct}>
                    <input type="hidden" name="section" value={section} />
                    <input type="hidden" name="productId" value={product.id} />

                    <button className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500">
              No products added to this section yet.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Add Product</h2>

        <form method="GET" className="mb-5 flex gap-3">
          <input type="hidden" name="section" value={section} />

          <input
            name="q"
            defaultValue={q}
            placeholder="Search product..."
            className="w-full rounded-lg border px-4 py-2"
          />

          <button className="rounded-lg bg-slate-900 px-5 py-2 text-white hover:bg-slate-800">
            Search
          </button>
        </form>

        <div className="space-y-3">
          {allProducts && allProducts.length > 0 ? (
            allProducts.map((product: any) => {
              const alreadyAdded =
                section === "featured"
                  ? product.featured
                  : product.best_seller

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name_en || "Product"}
                      className="h-14 w-14 rounded object-cover"
                    />

                    <div>
                      <p className="font-medium text-slate-900">
                        {product.name_en}
                      </p>
                      <p className="text-sm text-slate-500">
                        {product.name_ar}
                      </p>
                    </div>
                  </div>

                  {alreadyAdded ? (
                    <span className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-500">
                      Already Added
                    </span>
                  ) : (
                    <form action={addProduct}>
                      <input type="hidden" name="section" value={section} />
                      <input
                        type="hidden"
                        name="productId"
                        value={product.id}
                      />

                      <button className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200">
                        Add
                      </button>
                    </form>
                  )}
                </div>
              )
            })
          ) : (
            <p className="text-slate-500">No products found.</p>
          )}
        </div>
      </div>
    </div>
  )
}