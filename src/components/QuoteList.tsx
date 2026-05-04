"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function QuoteList({ quotes }: any) {

const router = useRouter()
const supabase = createClient()

const removeItem = async (id: string) => {

await supabase
.from("quote_cart")
.delete()
.eq("id", id)

router.refresh()

}

return (

<div className="space-y-4">

{quotes?.map((item: any) => (

<div
key={item.id}
className="flex items-center gap-4 border p-4 rounded-lg"
>

<img
src={item.products?.images?.[0]}
className="w-20 h-20 object-cover rounded"
/>

<div className="flex-1">

<h3 className="font-semibold">
{item.products?.name_en}
</h3>

<p className="text-gray-500">
Qty: {item.quantity}
</p>

</div>

<button
onClick={() => removeItem(item.id)}
className="text-red-500 font-semibold"
>
Remove
</button>

</div>

))}

</div>

)

}