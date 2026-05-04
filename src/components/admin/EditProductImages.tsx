"use client"

import { useState } from "react"

export default function EditProductImages({ images }: { images: string[] }) {

const [deleted, setDeleted] = useState<string[]>([])

const toggleDelete = (img:string) => {

if(deleted.includes(img)){
setDeleted(deleted.filter(i => i !== img))
}else{
setDeleted([...deleted, img])
}

}

return (

<div>

<label className="font-semibold">
Product Images
</label>

<div className="flex gap-3 flex-wrap mt-2">

{images?.map((img,index)=>(

<div key={index} className="relative">

<img
src={img}
className={`w-24 h-24 object-cover rounded border 
${deleted.includes(img) ? "opacity-40" : ""}`}
/>

<button
type="button"
onClick={()=>toggleDelete(img)}
className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs"

>

✕ </button>

</div>

))}

</div>

{/* Hidden inputs */}
{deleted.map((img,index)=>( <input
key={index}
type="hidden"
name="delete_images"
value={img}
/>
))}

<input
type="file"
name="images"
multiple
className="mt-3"
/>

</div>

)

}
