"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type FollowButtonProps = {
  followingId: string;
  isFollowing: boolean;
  currentUserId: string;
};

export function FollowButton({
  followingId,
  isFollowing: initialIsFollowing,
  currentUserId,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleFollow() {
    setLoading(true);
    const supabase = createClient();

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", followingId);
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: followingId,
      });
      setIsFollowing(true);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
        isFollowing
          ? "border border-sky-200 bg-white text-sky-900 hover:bg-sky-50 dark:border-sky-500 dark:bg-sky-900 dark:text-sky-100 dark:hover:bg-sky-800"
          : "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-600"
      }`}
    >
      {loading ? "…" : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
