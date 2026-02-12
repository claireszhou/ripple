"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createComment(postId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 280) {
    throw new Error("Ripple must be 1–280 characters");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: trimmed,
  });

  if (error) throw error;
  revalidatePath("/feed");
  revalidatePath("/profile");
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/feed");
  revalidatePath("/profile");
}
