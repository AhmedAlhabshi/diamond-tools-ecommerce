import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import QuoteList from "@/components/QuoteList"
import { sendQuoteRequest } from "@/app/actions/quote"

export default async function QuotePage() {

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get profile
  const { data: profile } = await supabase
    .from("users")
    .select("user_type, company_status")
    .eq("id", user.id)
    .single()

  const isCompanyPending =
    profile?.user_type === "company" &&
    profile?.company_status !== "approved"

  const { data: quotes } = await supabase
    .from("quote_cart")
    .select(`
      id,
      quantity,
      products (
        id,
        name_en,
        name_ar,
        images
      )
    `)
    .eq("user_id", user.id)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-6">
        Quote Request
      </h1>

      {/* Pending Message */}
      {isCompanyPending && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
          Your company is not approved yet.  
          You will receive an email once approved.
        </div>
      )}

      {quotes?.length === 0 && (
        <p>No items in quote</p>
      )}

      <QuoteList quotes={quotes} />

      {quotes && quotes.length > 0 && (
        <form action={sendQuoteRequest}>
          <button
            type="submit"
            disabled={isCompanyPending}
            className={`mt-6 px-6 py-3 rounded-lg font-semibold text-white
              ${isCompanyPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
              }
            `}
          >
            Send Quote Request
          </button>
        </form>
      )}

    </div>
  )
}