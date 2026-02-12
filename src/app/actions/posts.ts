"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPost(
  content: string,
  postedDate: string,
  postedPeriod: "AM" | "PM"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 280) {
    throw new Error("Drop must be 1–280 characters");
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content: trimmed,
    posted_date: postedDate,
    posted_period: postedPeriod,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        `You already dropped in the ${postedPeriod} slot today. One drop in the morning and one in the evening.`
      );
    }
    throw error;
  }
  revalidatePath("/feed");
}
