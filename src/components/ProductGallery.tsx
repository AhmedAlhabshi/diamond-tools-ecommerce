"use client"

import { useState } from "react"

export default function ProductGallery({ images }: { images: string[] }) {

const [selected, setSelected] = useState(0)

return (

<div className="flex gap-4">

{/* Thumbnails */}

<div className="flex flex-col gap-3">

{images?.map((img, i) => (

<button
key={i}
onClick={() => setSelected(i)}
className={`border rounded-lg overflow-hidden w-16 h-16 
${selected === i ? "border-blue-500" : ""}
`}
>

<img
src={img}
className="w-full h-full object-contain"
/>

</button>

))}

</div>


{/* Main Image */}

<div className="flex-1">

<div className="border rounded-xl p-4 bg-white">

<img
src={images?.[selected]}
className="w-full h-[350px] object-contain hover:scale-105 transition"
/>

</div>

</div>

</div>

)

}