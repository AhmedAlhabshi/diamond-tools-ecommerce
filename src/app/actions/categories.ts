'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'



// Get Categories
export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) {
    console.error(error)
    return []
  }

  return data
}


// Add Category
export async function addCategory(formData: FormData) {

  const supabase = await createClient()

  const name_ar = formData.get('name_ar') as string
  const name_en = formData.get('name_en') as string
  const image = formData.get('image') as File

  let imageUrl = null

  // Upload Image
  if (image && image.size > 0) {

    const fileName = `categories/${Date.now()}-${image.name}`

    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(fileName, image)

    if (uploadError) {
      console.error(uploadError)
    }

    const { data } = supabase.storage
      .from('categories')
      .getPublicUrl(fileName)

    imageUrl = data.publicUrl
  }

  const { error } = await supabase
    .from('categories')
    .insert({
      name_ar,
      name_en,
      image: imageUrl,
      slug: name_en.toLowerCase().replace(/\s+/g, '-')
    })

  if (error) {
    console.error(error)
  }
}



// Delete Category + related data
export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // 1) Get subcategories
  const { data: subCategories } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', id)

  const subCategoryIds = subCategories?.map((cat) => cat.id) || []

  const categoryIdsToDelete = [id, ...subCategoryIds]

  // 2) Delete products under category/subcategories
  const { data: products } = await supabase
    .from('products')
    .select('id, images')
    .in('category_id', categoryIdsToDelete)

  const productIds = products?.map((p) => p.id) || []

  if (productIds.length > 0) {
    // delete variants
    await supabase
      .from('product_variants')
      .delete()
      .in('product_id', productIds)

    // delete related products links
    await supabase
      .from('related_products')
      .delete()
      .or(
        `product_id.in.(${productIds.join(',')}),related_id.in.(${productIds.join(',')})`
      )

    // delete products
    await supabase
      .from('products')
      .delete()
      .in('id', productIds)
  }

  // 3) Delete subcategories first
  if (subCategoryIds.length > 0) {
    await supabase
      .from('categories')
      .delete()
      .in('id', subCategoryIds)
  }

  // 4) Delete main category
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('DELETE CATEGORY ERROR:', error)
    throw new Error(error.message)
  }
}