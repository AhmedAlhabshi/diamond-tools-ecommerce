import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { contactQuote, closedQuote } from "@/app/actions/quote"

export default async function AdminQuotesPage() {

  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const locale = await getLocale()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // check admin

  const { data: profile } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", user.id)
    .single()

  if (profile?.user_type !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  // get quotes (admin client)

const { data: quotes, error } = await admin
  .from("quote_requests")
  .select(`
    id,
    status,
    created_at,
    users:user_id (
      company_name,
      email,
      phone,
      name
    ),
    quote_request_items!quote_request_items_quote_id_fkey (
      quantity,
      products!quote_request_items_product_id_fkey (
        name_en
      )
    )
  `)
  .order("created_at", { ascending: false })

console.log("quotes:", quotes)
console.log("error:", error)

  return (

    <div className="max-w-6xl mx-auto py-10 px-4">

      <h1 className="text-3xl font-bold mb-6">
        Quote Requests
      </h1>

      {!quotes?.length && (
        <div className="bg-white p-6 rounded-xl shadow">
          No Quote Requests
        </div>
      )}

      {quotes?.map((quote: any) => (

        <div
          key={quote.id}
          className="bg-white p-6 rounded-xl shadow mb-4 border"
        >

          <div className="flex justify-between mb-4">

            <div>

              <h2 className="text-xl font-bold">
                {quote.users?.company_name}
              </h2>

              <p className="text-gray-500">
                {quote.users?.email}
              </p>

              <p className="text-sm text-gray-400">
                {quote.users?.phone}
              </p>

            </div>

            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              {quote.status}
            </span>

          </div>

          <div className="space-y-2">

            {quote.quote_request_items?.map((item: any, i: number) => (

              <div key={i}>
                {item.products?.name_en} - Qty: {item.quantity}
              </div>

            ))}

          </div>

          <div className="mt-4 text-sm text-gray-400">
            {new Date(quote.created_at).toLocaleString()}
          </div>

          {quote.status === "pending" && (

<div className="flex gap-2 mt-4">

<form action={contactQuote}>
<input type="hidden" name="id" value={quote.id} />
<button className="bg-green-500 text-white px-4 py-2 rounded">
Contacted
</button>
</form>

<form action={closedQuote}>
<input type="hidden" name="id" value={quote.id} />
<button className="bg-red-500 text-white px-4 py-2 rounded">
Closed
</button>
</form>

</div>

)}

        </div>

      ))}

    </div>

  )
}