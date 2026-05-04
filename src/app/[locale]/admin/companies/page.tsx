import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import ApproveCompanyButton from "../../../../components/ApproveCompanyButton"

export default async function AdminCompaniesPage() {

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const locale = await getLocale()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Check admin

  const { data: profile } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", user.id)
    .single()

  if (profile?.user_type !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  // Get companies

  const { data: companies } = await supabase
    .from("users")
    .select("*")
    .match({
      user_type: "company",
      company_status: "pending"
    })
    .order("created_at", { ascending: false })

  return (

    <div className="max-w-6xl mx-auto py-10 px-4">

      <h1 className="text-3xl font-bold mb-6">
        Company Approvals
      </h1>

      {!companies?.length && (
        <div className="bg-white p-6 rounded-xl shadow">
          No pending companies
        </div>
      )}

      {companies?.map((company) => (

        <div
          key={company.id}
          className="bg-white p-6 rounded-xl shadow mb-4 border hover:shadow-lg transition"
        >

          <div className="flex justify-between items-start mb-4">

            <div>

              <h2 className="text-xl font-bold">
                {company.company_name}
              </h2>

              <p className="text-gray-500">
                {company.email}
              </p>

            </div>

            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
              Pending
            </span>

          </div>

          {/* Company Details */}

          <div className="grid md:grid-cols-2 gap-4 text-sm">

            <div>
              <span className="font-semibold">Contact Person:</span>{" "}
              {company.name || "-"}
            </div>

            <div>
              <span className="font-semibold">Phone:</span>{" "}
              {company.phone || "-"}
            </div>

            <div>
              <span className="font-semibold">CR Number:</span>{" "}
              {company.cr_number || "-"}
            </div>

            <div>
              <span className="font-semibold">VAT Number:</span>{" "}
              {company.vat_number || "-"}
            </div>

            <div>
              <span className="font-semibold">National Address:</span>{" "}
              {company.national_address || "-"}
            </div>

            <div>
              <span className="font-semibold">Created At:</span>{" "}
              {new Date(company.created_at).toLocaleDateString()}
            </div>

          </div>

          {/* Documents */}

          {/* Documents */}

<div className="mt-6 grid md:grid-cols-3 gap-4">

  {company.cr_file && (
    <a
      href={`/pdf-viewer?url=${encodeURIComponent(company.cr_file)}`}
      target="_blank"
      className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-center font-semibold hover:bg-blue-100"
    >
      View CR
    </a>
  )}

  {company.vat_file && (
    <a
      href={`/pdf-viewer?url=${encodeURIComponent(company.vat_file)}`}
      target="_blank"
      className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-center font-semibold hover:bg-green-100"
    >
      View VAT
    </a>
  )}

  {company.national_address_file && (
    <a
      href={`/pdf-viewer?url=${encodeURIComponent(company.national_address_file)}`}
      target="_blank"
      className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg text-center font-semibold hover:bg-purple-100"
    >
      View National Address
    </a>
  )}

</div>

          <div className="mt-6">
            <ApproveCompanyButton id={company.id} />
          </div>

        </div>

      ))}

    </div>

  )
}