import { requireAuth, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreatePostForm } from "./CreatePostForm";
import { PostCard } from "@/components/PostCard";
import { FeedNav } from "./FeedNav";

export default async function FeedPage() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  if (!profile?.username) {
    redirect("/onboarding");
  }

  const supabase = await createClient();

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = follows?.map((f) => f.following_id) ?? [];
  const timelineUserIds = [user.id, ...followingIds];

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at, updated_at, user_id, posted_date, posted_period")
    .in("user_id", timelineUserIds)
    .order("created_at", { ascending: false });

  const usedSlots = (posts ?? [])
    .filter((p) => p.user_id === user.id)
    .map((p) => ({ posted_date: p.posted_date, posted_period: p.posted_period }));

  const postIds = (posts ?? []).map((p) => p.id);
  const authorIds = [...new Set((posts ?? []).map((p) => p.user_id))];
  const { data: authorProfiles } =
    authorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", authorIds)
      : { data: [] };
  const profileByUserId = new Map(
    (authorProfiles ?? []).map((p) => [p.id, p])
  );

  const { data: hearts } =
    postIds.length > 0
      ? await supabase
          .from("hearts")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds)
      : { data: [] };

  const heartedPostIds = new Set((hearts ?? []).map((h) => h.post_id));

  const { data: heartCounts } =
    postIds.length > 0
      ? await supabase
          .from("hearts")
          .select("post_id")
          .in("post_id", postIds)
      : { data: [] };

  const countByPost = (heartCounts ?? []).reduce(
    (acc, { post_id }) => {
      acc[post_id] = (acc[post_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const { data: comments } =
    postIds.length > 0
      ? await supabase
          .from("comments")
          .select("id, post_id, user_id, content, created_at")
          .in("post_id", postIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const commentAuthorIds = [
    ...new Set((comments ?? []).map((c) => c.user_id)),
  ];
  const { data: commentProfiles } =
    commentAuthorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", commentAuthorIds)
      : { data: [] };
  const commentProfileMap = new Map(
    (commentProfiles ?? []).map((p) => [p.id, p])
  );

  const commentsByPostId = (comments ?? []).reduce(
    (acc, c) => {
      const list = acc[c.post_id] ?? [];
      list.push({
        id: c.id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        author: commentProfileMap.get(c.user_id) ?? {
          username: null,
          display_name: null,
          avatar_url: null,
        },
      });
      acc[c.post_id] = list;
      return acc;
    },
    {} as Record<string, Array<{ id: string; user_id: string; content: string; created_at: string; author: { username: string | null; display_name: string | null; avatar_url: string | null } }>>
  );

  return (
    <div className="min-h-screen">
      <FeedNav profile={profile} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <CreatePostForm usedSlots={usedSlots} />
        <ul className="mt-6 flex flex-col gap-4">
          {(posts ?? []).map((post) => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                content: post.content,
                created_at: post.created_at,
                updated_at: post.updated_at,
                user_id: post.user_id,
                author: profileByUserId.get(post.user_id) ?? {
                  username: null,
                  display_name: null,
                  avatar_url: null,
                },
                posted_date: post.posted_date,
                posted_period: post.posted_period,
              }}
              heartCount={countByPost[post.id] ?? 0}
              isHearted={heartedPostIds.has(post.id)}
              comments={commentsByPostId[post.id] ?? []}
              currentUserId={user.id}
            />
          ))}
        </ul>
        {(!posts || posts.length === 0) && (
          <p className="mt-8 text-center text-sky-900 dark:text-sky-100">
            No drops yet. Share something you&apos;re grateful for, or search for
            friends to follow.
          </p>
        )}
      </main>
    </div>
  );
}
