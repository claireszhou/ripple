import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthWithProfile } from "@/lib/auth";
import { FollowButton } from "@/components/FollowButton";
import { ProfileNav } from "../ProfileNav";

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { user, profile: currentProfile } = await getAuthWithProfile();

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username.toLowerCase())
    .single();

  if (profileError || !profile) {
    notFound();
  }

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", profile.id);

  const followingIds = (follows ?? []).map((f) => f.following_id);
  const { data: profiles } =
    followingIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", followingIds)
      : { data: [] };

  let isFollowingMap: Record<string, boolean> = {};
  if (user && (profiles ?? []).length > 0) {
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", followingIds);
    isFollowingMap = Object.fromEntries(
      (myFollows ?? []).map((f) => [f.following_id, true])
    );
  }

  return (
    <div className="min-h-screen">
      {currentProfile ? (
        <ProfileNav profile={currentProfile} />
      ) : (
        <nav className="border-b border-sky-200 bg-white dark:border-sky-800 dark:bg-sky-950">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="font-logo text-2xl font-semibold lowercase tracking-wide text-sky-900 dark:text-sky-100"
            >
              ((ripple))
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-sky-900 hover:text-sky-800 dark:text-sky-100 dark:hover:text-sky-200"
            >
              Sign in
            </Link>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href={`/profile/${username}`}
          className="mb-4 inline-block text-sm text-sky-900 hover:underline dark:text-sky-100"
        >
          ← Back to <span className="text-sky-600 dark:text-sky-400">@{username}</span>
        </Link>
        <h1 className="mb-4 text-xl font-semibold text-sky-900 dark:text-sky-100">
          <span className="text-sky-600 dark:text-sky-400">@{username}</span> follows
        </h1>
        <ul className="flex flex-col gap-3">
          {(profiles ?? []).map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-sky-200 bg-white p-3 dark:border-sky-800 dark:bg-sky-900"
            >
              <Link href={`/profile/${p.username}`} className="flex items-center gap-3">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt=""
                    className="h-10 w-10 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-200 text-sky-900 dark:bg-sky-700 dark:text-sky-100">
                    {(p.display_name ?? p.username ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-sky-600 dark:text-sky-400">
                  @{p.username}
                </span>
              </Link>
              {user && user.id !== p.id && (
                <FollowButton
                  followingId={p.id}
                  isFollowing={!!isFollowingMap[p.id]}
                  currentUserId={user.id}
                />
              )}
            </li>
          ))}
        </ul>
        {(!profiles || profiles.length === 0) && (
          <p className="text-sky-900 dark:text-sky-100">Not following anyone yet.</p>
        )}
      </main>
    </div>
  );
}
