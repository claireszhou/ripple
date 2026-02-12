"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_following: boolean;
};

export async function searchUsers(
  query: string,
  currentUserId: string
): Promise<SearchResult[]> {
  const supabase = await createClient();
  const q = query.trim().toLowerCase();

  if (q.length < 1) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .not("username", "is", null)
    .ilike("username", `%${q}%`)
    .limit(20);

  if (!profiles || profiles.length === 0) return [];

  const ids = profiles.map((p) => p.id).filter(Boolean);
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", currentUserId)
    .in("following_id", ids);

  const followingSet = new Set((follows ?? []).map((f) => f.following_id));

  return profiles
    .filter((p) => p.id !== currentUserId)
    .map((p) => ({
      ...p,
      is_following: followingSet.has(p.id),
    }));
}
