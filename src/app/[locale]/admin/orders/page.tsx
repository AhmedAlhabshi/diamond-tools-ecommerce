"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"

export default function AdminOrdersPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()

  const locale = params.locale || "en"

  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700"
      case "processing":
        return "bg-blue-100 text-blue-700"
      case "ready":
        return "bg-purple-100 text-purple-700"
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const fetchOrders = async () => {
    setLoading(true)

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Orders error:", error)
      setOrders([])
    } else {
      setOrders(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [status])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount || 0)
  }

  const filteredOrders = orders.filter((order) => {
    const keyword = search.toLowerCase()

    return (
      order.email?.toLowerCase().includes(keyword) ||
      order.customer_name?.toLowerCase().includes(keyword) ||
      order.phone?.toLowerCase().includes(keyword) ||
      order.id?.toLowerCase().includes(keyword)
    )
  })

  return (
    <div className="bg-slate-50 min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 mt-1">
          View and manage customer orders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">

        <input
          placeholder="Search by email, phone, or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 px-4 py-2 rounded-lg w-full md:w-80 outline-none focus:ring-2 focus:ring-slate-300"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-200 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-slate-100 text-sm text-slate-600">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No orders found
                  </td>
                </tr>
              )}

              {!loading && filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/${locale}/admin/orders/${order.id}`)}
                  className="border-t hover:bg-slate-50 cursor-pointer transition"
                >

                  <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>

                  <td className="p-4 text-sm">
                    <div className="font-medium text-slate-900">
                      {order.customer_name || "Guest"}
                    </div>
                    <div className="text-slate-500">
                      {order.email || "-"}
                    </div>
                    <div className="text-slate-500 dir-ltr">
                      {order.phone || "-"}
                    </div>
                  </td>

                  <td className="p-4 text-sm">
                    <div className="font-medium capitalize">
                      {order.fulfillment_method || "-"}
                    </div>

                    {order.fulfillment_method === "pickup" && (
                      <div className="text-xs text-slate-500">
                        {order.pickup_branch || "No branch"}
                      </div>
                    )}

                    {order.fulfillment_method === "delivery" && (
                      <div className="text-xs text-slate-500">
                        Delivery fee: {formatCurrency(order.delivery_fee || 0)}
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                    {formatCurrency(order.total || 0)}
                  </td>

                  <td className="p-4 text-sm">
                    <div className="font-medium">
                      {order.payment_method || "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {order.payment_status || "-"}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status || "pending"}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-GB")
                      : "-"}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>

      </div>

    </div>
  )
}
