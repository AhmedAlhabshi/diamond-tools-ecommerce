import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const product_id = searchParams.get("product_id");

  const supabase = await createClient();

  const { data } = await supabase
    .from("product_downloads")
    .select("*")
    .eq("product_id", product_id);

  return NextResponse.json(data || []);
}