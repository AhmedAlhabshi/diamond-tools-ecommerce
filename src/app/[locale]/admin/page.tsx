import { getAdminStats } from '@/app/actions/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import {
Package,
ShoppingBag,
Users,
DollarSign,
AlertTriangle
} from 'lucide-react'

export default async function AdminDashboardPage() {

const supabase = await createClient()
const locale = await getLocale()

// Check user login
const {
data: { user },
} = await supabase.auth.getUser()

// If not logged in → go login
if (!user) {
redirect(`/${locale}/login`)
}

// Get user role
const { data: profile } = await supabase
.from("users")
.select("role")
.eq("id", user.id)
.single()

// If not admin → go home
if (profile?.role !== "admin") {
redirect(`/${locale}`)
}


const stats = await getAdminStats()


// Recent Orders
const { data: orders } = await supabase
.from("orders")
.select(`
*,
users!orders_user_id_fkey (
name,
email
)`)
.order("created_at",{ascending:false})
.limit(5)


// Low Stock
const { data: lowStock } = await supabase
.from("products")
.select("*")
.lt("stock",5)
.limit(5)


// Latest Products
const { data: latestProducts } = await supabase
.from("products")
.select("*")
.order("created_at",{ascending:false})
.limit(5)


// Top Products
const { data: topProducts } = await supabase
.from("products")
.select("*")
.order("stock",{ascending:true})
.limit(5)


// Recent Customers
const { data: customers } = await supabase
.from("users")
.select("*")
.order("created_at",{ascending:false})
.limit(5)


// Order Status
const { data: orderStatus } = await supabase
.from("orders")
.select("status")


// Sales Data
const { data: sales } = await supabase
.from("orders")
.select("total, created_at")
.order("created_at",{ascending:true})


const formatCurrency = (amount: number) => {
return new Intl.NumberFormat('en-SA', {
style: 'currency',
currency: 'SAR'
}).format(amount)
}


// Order Status Count
const statusCount = {
Pending: orderStatus?.filter(o=>o.status==="Pending").length || 0,
Processing: orderStatus?.filter(o=>o.status==="Processing").length || 0,
Completed: orderStatus?.filter(o=>o.status==="Completed").length || 0,
Cancelled: orderStatus?.filter(o=>o.status==="Cancelled").length || 0
}


const statCards = [
{
title: 'Total Revenue',
value: formatCurrency(stats.sales),
icon: DollarSign,
color: 'text-emerald-600',
bg: 'bg-emerald-100'
},
{
title: 'Total Orders',
value: stats.orders,
icon: ShoppingBag,
color: 'text-blue-600',
bg: 'bg-blue-100'
},
{
title: 'Total Products',
value: stats.products,
icon: Package,
color: 'text-purple-600',
bg: 'bg-purple-100'
},
{
title: 'Total Customers',
value: stats.customers,
icon: Users,
color: 'text-orange-600',
bg: 'bg-orange-100'
}
]


return (

<div className="admin-panel p-8 bg-slate-50 min-h-screen">

<h1 className="text-3xl font-bold text-slate-900 mb-8">
Dashboard Overview
</h1>


{/* Stats */}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

{statCards.map((card)=> (

<div
key={card.title}
className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
>

<div className="flex items-center gap-4">

<div className={`p-3 rounded-lg ${card.bg}`}>
<card.icon className={`h-6 w-6 ${card.color}`} />
</div>

<div>

<p className="text-sm font-medium text-slate-600">
{card.title}
</p>

<p className="text-2xl font-bold text-slate-900">
{card.value}
</p>

</div>

</div>

</div>

))}

</div>



{/* Grid */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


{/* Recent Orders */}

<div className="bg-white rounded-xl shadow-sm border p-6">

<h2 className="text-xl font-bold mb-4">
Recent Orders
</h2>

<table className="w-full">

<thead>

<tr className="border-b text-sm">

<th className="text-left py-2">Customer</th>
<th className="text-left py-2">Total</th>
<th className="text-left py-2">Status</th>

</tr>

</thead>

<tbody>

{orders?.map((order)=> (

<tr key={order.id} className="border-b text-sm">

<td className="py-3">
{order.users?.name}
</td>

<td>
{formatCurrency(order.total)}
</td>

<td>

<span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
{order.status}
</span>

</td>

</tr>

))}

</tbody>

</table>

</div>


{/* Low Stock */}

<div className="bg-white rounded-xl shadow-sm border p-6">

<div className="flex items-center gap-2 mb-4">

<AlertTriangle className="text-orange-500"/>

<h2 className="text-xl font-bold">
Low Stock
</h2>

</div>

<div className="space-y-3">

{lowStock?.map((product)=> (

<div
key={product.id}
className="flex justify-between border-b pb-2 text-sm"
>

<div>
{product.name_en}
</div>

<div className="text-red-500 font-semibold">
{product.stock}
</div>

</div>

))}

</div>

</div>

</div>


{/* Top Products */}

<div className="bg-white rounded-xl shadow-sm border p-6 mt-6">

<h2 className="text-xl font-bold mb-4">
Top Products
</h2>

<div className="space-y-3">

{topProducts?.map((product)=> (

<div
key={product.id}
className="flex justify-between border-b pb-2 text-sm"
>

<div>

<div className="font-semibold">
{product.name_en}
</div>

<div className="text-gray-500">
{product.name_ar}
</div>

</div>

<div>

{formatCurrency(product.price)}

</div>

</div>

))}

</div>

</div>



{/* Recent Customers */}

<div className="bg-white rounded-xl shadow-sm border p-6 mt-6">

<h2 className="text-xl font-bold mb-4">
Recent Customers
</h2>

<div className="space-y-3">

{customers?.map((user)=> (

<div
key={user.id}
className="flex justify-between border-b pb-2 text-sm"
>

<div>

<div className="font-semibold">
{user.name}
</div>

<div className="text-gray-500">
{user.email}
</div>

</div>

</div>

))}

</div>

</div>


{/* Latest Products */}

<div className="bg-white rounded-xl shadow-sm border p-6 mt-6">

<h2 className="text-xl font-bold mb-4">
Latest Products
</h2>

<div className="space-y-3">

{latestProducts?.map((product)=> (

<div
key={product.id}
className="flex justify-between border-b pb-2 text-sm"
>

<div>

<div className="font-semibold">
{product.name_en}
</div>

<div className="text-gray-500">
{product.name_ar}
</div>

</div>

<div>

{formatCurrency(product.price)}

</div>

</div>

))}

</div>

</div>


</div>

)

}