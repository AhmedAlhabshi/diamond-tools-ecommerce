'use client'

import { approveCompany, rejectCompany } from "@/app/actions/admin"

export default function ApproveCompanyButton({ id }: { id: string }) {

  return (
    <div className="flex gap-3 mt-4">

      <form action={approveCompany}>
        <input type="hidden" name="id" value={id} />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          Approve
        </button>
      </form>

      <form action={rejectCompany}>
        <input type="hidden" name="id" value={id} />

        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
        >
          Reject
        </button>
      </form>

    </div>
  )
}