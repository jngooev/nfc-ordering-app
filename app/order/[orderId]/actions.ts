"use server";

import { createServerClient } from "@/src/lib/supabase/serverClient";

export async function saveOrderEmail(
  orderId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ customer_email: email })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
