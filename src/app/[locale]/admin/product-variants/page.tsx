"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Product = {
id: string
name_en: string
}

export default function ProductVariantsPage() {

const supabase = createClient()

const [products, setProducts] = useState<Product[]>([])
const [selectedProduct, setSelectedProduct] = useState<string>("")
const [variants, setVariants] = useState<any[]>([])

useEffect(() => {
fetchProducts()
}, [])

useEffect(() => {
if (selectedProduct) {
fetchVariants()
}
}, [selectedProduct])

const fetchProducts = async () => {

const { data } = await supabase
.from("products")
.select("id, name_en")
.order("name_en")

if (data) setProducts(data)

}

const fetchVariants = async () => {

const { data } = await supabase
.from("product_variants")
.select("*")
.eq("product_id", selectedProduct)

setVariants(data || [])

}

const addVariant = () => {
setVariants([
...variants,
{ size: "", grade: "", price: "", stock: "" }
])
}

const removeVariant = (index:number) => {
const newVariants = [...variants]
newVariants.splice(index,1)
setVariants(newVariants)
}

const saveVariants = async () => {

if (!selectedProduct) return

// delete old variants
await supabase
.from("product_variants")
.delete()
.eq("product_id", selectedProduct)

// insert new variants
const insertData = variants.map(v => ({
product_id: selectedProduct,
size: v.size || null,
grade: v.grade || null,
price: Number(v.price),
stock: Number(v.stock) || 0
}))

await supabase
.from("product_variants")
.insert(insertData)

// reload clean
await fetchVariants()

}

return (

<div className="p-8 max-w-6xl">

<h1 className="text-2xl font-bold mb-6">
Product Variants
</h1>

<select
value={selectedProduct}
onChange={(e)=>setSelectedProduct(e.target.value)}
className="border p-2 rounded w-full mb-6"
>

<option value="">Select Product</option>

{products.map((product)=>(
<option key={product.id} value={product.id}>
{product.name_en}
</option>
))}

</select>

{selectedProduct && (

<div className="space-y-4">

<div className="grid grid-cols-4 gap-2 font-semibold">
<div>Size</div>
<div>Grade</div>
<div>Price</div>
<div>Stock</div>
</div>

{variants.map((variant, index) => (

<div key={index} className="grid grid-cols-4 gap-2">

<input
value={variant.size || ""}
onChange={(e)=>{
const newVariants = [...variants]
newVariants[index].size = e.target.value
setVariants(newVariants)
}}
className="border p-2 rounded"
/>

<input
value={variant.grade || ""}
onChange={(e)=>{
const newVariants = [...variants]
newVariants[index].grade = e.target.value
setVariants(newVariants)
}}
className="border p-2 rounded"
/>

<input
value={variant.price || ""}
onChange={(e)=>{
const newVariants = [...variants]
newVariants[index].price = e.target.value
setVariants(newVariants)
}}
className="border p-2 rounded"
/>

<input
value={variant.stock || ""}
onChange={(e)=>{
const newVariants = [...variants]
newVariants[index].stock = e.target.value
setVariants(newVariants)
}}
className="border p-2 rounded"
/>

<button
onClick={()=>removeVariant(index)}
className="flex items-center justify-center
border px-6 py-3 rounded-lg 
hover:bg-gray-50 transition"
>
Delete
</button>

</div>

))}

<div className="flex gap-3 pt-4">

<button
onClick={addVariant}
className="flex items-center justify-center
border px-6 py-3 rounded-lg 
hover:bg-gray-50 transition"
>
Add Variant
</button>

<button
onClick={saveVariants}
className="flex items-center justify-center
border px-6 py-3 rounded-lg 
hover:bg-gray-50 transition"
>
Save Variants
</button>

</div>

</div>

)}

</div>

)

}