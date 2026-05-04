'use server'

import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Brand = Database['public']['Tables']['brands']['Row']


// Get Products
export async function getProducts(options?: {
  categoryId?: string
  brandId?: string
  price?: string
  search?: string
}) {

  const supabase = await createClient()

let query = supabase
  .from('products')
  .select(`
    *,
    product_variants!product_variants_product_id_fkey(*)
  `)
  .eq("is_active", true)
  .order('created_at', { ascending: false })

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options?.brandId) {
    query = query.eq('brand_id', options.brandId)
  }

  if (options?.price) {
    if (options.price.includes('-')) {
      const [min, max] = options.price.split('-')
      query = query
        .gte('individual_price', Number(min))
        .lte('individual_price', Number(max))
    } else {
      query = query.gte('individual_price', Number(options.price))
    }
  }

  if (options?.search) {
    query = query.or(
      `name_ar.ilike.%${options.search}%,name_en.ilike.%${options.search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  // 🔥 ADD THIS PART (IMPORTANT)
  const formatted = data?.map((product: any) => {

    let lowestVariant = null

    if (product.product_variants?.length > 0) {
      lowestVariant = product.product_variants.reduce((min: any, current: any) =>
        current.price < min.price ? current : min
      )
    }

    return {
      ...product,
      variant: lowestVariant
    }
  })

  return formatted || []
}


// Get Single Product
export async function getProduct(id: string) {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}


export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id)

  if (error) {
    console.error("DELETE PRODUCT ERROR:", error)
    throw new Error(error.message)
  }

  revalidatePath("/en/admin/products")
}


export async function updateProduct(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .single()

  if (existingError) {
    console.error("Existing product error:", existingError)
    throw new Error("Product not found")
  }

  let images: string[] = existing?.images || []

  const deleteImages = formData.getAll("delete_images").map(String)

  if (deleteImages.length > 0) {
    images = images.filter((img) => !deleteImages.includes(img))

    const storagePaths = deleteImages
      .map((url) => {
        const marker = "/storage/v1/object/public/products/"
        const index = url.indexOf(marker)

        if (index === -1) return null

        return url.substring(index + marker.length)
      })
      .filter(Boolean) as string[]

    if (storagePaths.length > 0) {
      const { error: storageDeleteError } = await supabase.storage
        .from("products")
        .remove(storagePaths)

      if (storageDeleteError) {
        console.error("Storage delete error:", storageDeleteError)
      }
    }
  }

  const files = formData.getAll("images") as File[]

  for (const file of files) {
    if (!file || file.size === 0) continue

    const fileName = `products/${Date.now()}-${Math.random()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      continue
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName)

    images.push(data.publicUrl)
  }

  const updatedProduct = {
    name_ar: formData.get("name_ar"),
    name_en: formData.get("name_en"),

    individual_price: Number(formData.get("individual_price")) || 0,
    discount_price: formData.get("discount_price")
      ? Number(formData.get("discount_price"))
      : null,

    description_ar: formData.get("description_ar"),
    description_en: formData.get("description_en"),

    specifications_ar: formData.get("specifications_ar"),
    specifications_en: formData.get("specifications_en"),

    stock: Number(formData.get("stock")) || 0,

    brand_id: formData.get("brand_id") || null,
    category_id: formData.get("category_id") || null,
    sub_category_id: formData.get("sub_category_id") || null,

    featured: formData.get("featured") === "on",
    best_seller: formData.get("best_seller") === "on",

    images,
  }

  const { error } = await supabase
    .from("products")
    .update(updatedProduct)
    .eq("id", id)

  if (error) {
    console.error("UPDATE ERROR:", error)
    throw new Error("Update failed")
  }

  const relatedIds = formData.getAll("related_products")

  await supabase
    .from("related_products")
    .delete()
    .eq("product_id", id)

  if (relatedIds.length > 0) {
    const inserts = relatedIds.map((rid) => ({
      product_id: id,
      related_id: String(rid),
    }))

    const { error: relError } = await supabase
      .from("related_products")
      .insert(inserts)

    if (relError) {
      console.error("RELATED ERROR:", relError)
    }
  }

  revalidatePath("/en/admin/products")
  revalidatePath(`/en/admin/products/edit/${id}`)

  redirect(`/en/admin/products/edit/${id}?success=true`)
}

// Get Categories
export async function getCategories() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) return []

  return data as Category[]
}

// Get Brands
export async function getBrands() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('sort_order')

  if (error) return []

  return data as Brand[]
}

// 🔥 GET DOWNLOADS FOR PRODUCT
export async function getProductDownloads(productId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("product_downloads")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("DOWNLOADS ERROR:", error)
    return []
  }

  return data || []
}


// 🔥 ADD DOWNLOAD
export async function addProductDownload(formData: FormData) {
  const supabase = await createClient()

  const productId = formData.get("product_id") as string
  const title_en = formData.get("title_en") as string
  const title_ar = formData.get("title_ar") as string
  const file = formData.get("file") as File

  if (!file || file.size === 0) {
    throw new Error("No file uploaded")
  }

  const filePath = `downloads/${productId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("product-downloads")
    .upload(filePath, file)

  if (uploadError) {
    console.error("UPLOAD ERROR:", uploadError)
    throw new Error("Upload failed")
  }

  const { data } = supabase.storage
    .from("product-downloads")
    .getPublicUrl(filePath)

  const { error: insertError } = await supabase
    .from("product_downloads")
    .insert({
      product_id: productId,
      title_en,
      title_ar,
      file_url: data.publicUrl,
      file_path: filePath,
    })

if (insertError) {
  console.error("INSERT ERROR DETAILS:", {
    message: insertError.message,
    details: insertError.details,
    hint: insertError.hint,
    code: insertError.code,
  })

  throw new Error(insertError.message)
}

  revalidatePath(`/en/admin/products/edit/${productId}`)
}


// 🔥 DELETE DOWNLOAD
export async function deleteProductDownload(id: string, filePath: string) {
  const supabase = await createClient()

  await supabase.storage
    .from("product-downloads")
    .remove([filePath])

  const { error } = await supabase
    .from("product_downloads")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("DELETE DOWNLOAD ERROR:", error)
  }
}