"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminCustomersPage(){

const supabase = createClient()

const [customers,setCustomers] = useState<any[]>([])
const [search,setSearch] = useState("")

const fetchCustomers = async ()=>{

const { data } = await supabase
.from("users")
.select(`
*,
orders (
id,
total
)
`)
.order("created_at",{ascending:false})

setCustomers(data || [])

}

useEffect(()=>{
fetchCustomers()
},[])


const filteredCustomers = customers.filter(customer=>
customer.name?.toLowerCase().includes(search.toLowerCase())
)


const formatCurrency = (amount:number)=>{
return new Intl.NumberFormat("en-SA",{
style:"currency",
currency:"SAR"
}).format(amount)
}


return(

<div className="p-8 bg-slate-50 min-h-screen">

<h1 className="text-3xl font-bold mb-6">
Customers
</h1>


{/* Search */}

<div className="mb-6">

<input
placeholder="Search customer..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="border p-2 rounded w-72"
/>

</div>


{/* Table */}

<div className="bg-white rounded-xl shadow-sm border overflow-hidden">

<table className="w-full">

<thead className="bg-gray-50">

<tr className="text-left text-sm">

<th className="p-4">Customer</th>
<th className="p-4">Orders</th>
<th className="p-4">Total Spent</th>
<th className="p-4">Phone</th>
<th className="p-4">City</th>
<th className="p-4">Joined</th>

</tr>

</thead>

<tbody>

{filteredCustomers.map(customer=>{

const totalOrders = customer.orders?.length || 0

const totalSpent = customer.orders?.reduce(
(sum:any,order:any)=> sum + order.total,
0
) || 0


return(

<tr key={customer.id} className="border-t hover:bg-gray-50">

<td className="p-4">

<div className="font-semibold">
{customer.name}
</div>

<div className="text-sm text-gray-500">
{customer.email}
</div>

</td>

<td className="p-4">
{totalOrders}
</td>

<td className="p-4 font-semibold">
{formatCurrency(totalSpent)}
</td>

<td className="p-4 text-sm">
{customer.phone || "-"}
</td>

<td className="p-4 text-sm">
{customer.city || "-"}
</td>

<td className="p-4 text-sm">

{new Date(customer.created_at).toLocaleDateString()}

</td>

</tr>

)

})}

</tbody>

</table>

</div>

</div>

)

}