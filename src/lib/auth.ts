import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
};

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export async function getAuthWithProfile() {
  const user = await getCurrentUser();
  if (!user) return { user: null, profile: null };
  const profile = await getProfile(user.id);
  return { user, profile };
}
