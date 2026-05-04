"use client"

import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer
} from "recharts"

export default function SalesChart({data}:any){

return(

<div className="bg-white rounded-xl shadow-sm border p-6">

<h2 className="text-xl font-bold mb-4">
Sales Overview
</h2>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={data}>

<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="date" />

<YAxis />

<Tooltip />

<Line
type="monotone"
dataKey="total"
stroke="#2563eb"
strokeWidth={2}
/>

</LineChart>

</ResponsiveContainer>

</div>

)

}