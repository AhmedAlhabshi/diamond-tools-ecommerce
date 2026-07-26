"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type Section = "featured" | "best_seller"

function getColumns(section: Section) {
  if (section === "featured") {
    return {
      flagColumn: "featured",
      orderColumn: "featured_sort_order",
    }
  }

  return {
    flagColumn: "best_seller",
    orderColumn: "best_seller_sort_order",
  }
}

export async function addHomepageProduct(section: Section, productId: string) {
  const supabase = await createClient()
  const { flagColumn, orderColumn } = getColumns(section)

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq(flagColumn, true)

  const { error } = await supabase
    .from("products")
    .update({
      [flagColumn]: true,
      [orderColumn]: count || 0,
    })
    .eq("id", productId)

  if (error) throw new Error(error.message)

  revalidatePath("/")
  revalidatePath("/en")
  revalidatePath("/ar")
}

export async function removeHomepageProduct(section: Section, productId: string) {
  const supabase = await createClient()
  const { flagColumn } = getColumns(section)

  const { error } = await supabase
    .from("products")
    .update({
      [flagColumn]: false,
    })
    .eq("id", productId)

  if (error) throw new Error(error.message)

  revalidatePath("/")
  revalidatePath("/en")
  revalidatePath("/ar")
}

export async function updateHomepageProductsOrder(
  section: Section,
  productIds: string[]
) {
  const supabase = await createClient()
  const { orderColumn } = getColumns(section)

  for (let index = 0; index < productIds.length; index++) {
    const { error } = await supabase
      .from("products")
      .update({
        [orderColumn]: index,
      })
      .eq("id", productIds[index])

    if (error) throw new Error(error.message)
  }

  revalidatePath("/")
  revalidatePath("/en")
  revalidatePath("/ar")
}