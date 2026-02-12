import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthWithProfile } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";
import { FollowButton } from "@/components/FollowButton";
import { ProfileNav } from "./ProfileNav";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { user, profile: currentProfile } = await getAuthWithProfile();

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, created_at")
    .eq("username", username.toLowerCase())
    .single();

  if (profileError || !profile) {
    notFound();
  }

  const isOwnProfile = user?.id === profile.id;

  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id);

  let isFollowing = false;
  if (user && !isOwnProfile) {
    const { data: follow } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .single();
    isFollowing = !!follow;
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at, updated_at, user_id, posted_date, posted_period")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const postIds = (posts ?? []).map((p) => p.id);

  const { data: hearts } =
    user && postIds.length > 0
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

  const QUOTES = [
    "Gratitude turns what we have into enough.",
    "The more you practice gratitude, the more you see to be grateful for.",
    "Happiness is not something ready made. It comes from your own actions.",
    "Enjoy the little things, for one day you may look back and realize they were the big things.",
    "What we think, we become.",
    "The only way to do great work is to love what you do.",
    "Start each day with a grateful heart.",
    "Count your rainbows, not your thunderstorms.",
    "Appreciate what you have before it becomes what you had.",
    "Gratitude is the healthiest of all human emotions.",
    "When we give cheerfully and accept gratefully, everyone is blessed.",
    "A grateful mind is a great mind.",
    "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.",
    "The struggle ends when gratitude begins.",
    "Happiness doesn't come from what we have, but from appreciating what we have.",
    "Let us be grateful to the people who make us happy; they are the charming gardeners who make our souls blossom.",
    "Gratitude is not only the greatest of virtues but the parent of all others.",
    "When you arise in the morning, think of what a precious privilege it is to be alive.",
    "Gratitude unlocks the fullness of life.",
    "Be thankful for what you have; you'll end up having more.",
    "The best things in life aren't things.",
    "Joy is the simplest form of gratitude.",
    "Gratitude is the fairest blossom which springs from the soul.",
    "We often take for granted the very things that most deserve our gratitude.",
    "Develop an attitude of gratitude, and give thanks for everything that happens to you.",
    "Gratitude can transform common days into thanksgivings.",
    "It's not happiness that brings us gratitude. It's gratitude that brings us happiness.",
    "The root of joy is gratefulness.",
    "In ordinary life we hardly realize that we receive a great deal more than we give.",
    "Gratitude is a powerful catalyst for happiness.",
    "Feeling grateful or appreciative of someone or something in your life actually attracts more of the things that you appreciate.",
    "Wear gratitude like a cloak and it will feed every corner of your life.",
    "As we express our gratitude, we must never forget that the highest appreciation is not to utter words but to live by them.",
    "Gratitude is the sign of noble souls.",
    "When you are grateful, fear disappears and abundance appears.",
    "No one who achieves success does so without acknowledging the help of others.",
    "The more you recognize and express gratitude for the things you have, the more things you will have to express gratitude for.",
    "Gratitude makes us feel happy and satisfaction with our lives.",
    "Gratitude is when memory is stored in the heart and not in the mind.",
    "Kindness is the language which the deaf can hear and the blind can see.",
    "The world is full of wonderful things you haven't seen yet.",
    "Wherever you go, go with all your heart.",
    "Do what you can, with what you have, where you are.",
    "It's the little things in life that matter most.",
    "Every day may not be good, but there's something good in every day.",
    "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    "Happiness is not in the mere possession of money; it lies in the joy of achievement.",
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "Life is what happens when you're busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "In the end, it's not the years in your life that count. It's the life in your years.",
    "Life is 10% what happens to you and 90% how you react to it.",
    "The only impossible journey is the one you never begin.",
    "Believe you can and you're halfway there.",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "You are never too old to set another goal or to dream a new dream.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Act as if what you do makes a difference. It does.",
    "The purpose of our lives is to be happy.",
    "Nothing is impossible. The word itself says I'm possible.",
    "You get in life what you have the courage to ask for.",
    "Your life does not get better by chance, it gets better by change.",
    "Fall in love with the process and the results will come.",
    "The only way to achieve the impossible is to believe it is possible.",
    "Small steps in the right direction can turn out to be the biggest step of your life.",
    "You don't have to be great to start, but you have to start to be great.",
    "Every accomplishment starts with the decision to try.",
    "Believe in yourself. You are braver than you think.",
    "Today's small steps lead to tomorrow's big achievements.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The secret of getting ahead is getting started.",
    "You are stronger than you think and braver than you believe.",
    "Progress, not perfection.",
    "A year from now you may wish you had started today.",
    "Every moment is a fresh beginning.",
    "The best preparation for tomorrow is doing your best today.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Begin anywhere.",
    "You are never too old to set another goal or dream a new dream.",
    "The journey of a thousand miles begins with a single step.",
    "Today is a new beginning, a chance to turn your failures into strengths.",
    "What you get by achieving your goals is not as important as what you become.",
    "Don't watch the clock; do what it does. Keep going.",
    "The only bad workout is the one that didn't happen.",
    "Focus on progress, not perfection.",
    "You're one step closer than you were yesterday.",
    "Each new day is a blank page in the diary of your life.",
    "Opportunities don't happen. You create them.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't limit your challenges. Challenge your limits.",
    "Every day is a chance to begin again.",
    "You have within you right now, everything you need to deal with whatever the world throws at you.",
  ];

  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dailyQuote = QUOTES[daysSinceEpoch % QUOTES.length];

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
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-16 w-16 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-200 text-2xl text-sky-900 dark:bg-sky-700 dark:text-sky-100">
                  {(profile.display_name ?? profile.username ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold text-sky-900 dark:text-sky-100">
                  {profile.display_name ?? profile.username}
                </h1>
                <p className="text-sky-600 dark:text-sky-400">
                  @{profile.username}
                </p>
                <div className="mt-2 flex gap-4 text-sm">
                  <Link
                    href={`/profile/${profile.username}/followers`}
                    className="font-medium text-sky-900 hover:underline dark:text-sky-100"
                  >
                    <span className="font-semibold text-sky-900 dark:text-sky-100">
                      {followerCount ?? 0}
                    </span>{" "}
                    followers
                  </Link>
                  <Link
                    href={`/profile/${profile.username}/following`}
                    className="font-medium text-sky-900 hover:underline dark:text-sky-100"
                  >
                    <span className="font-semibold text-sky-900 dark:text-sky-100">
                      {followingCount ?? 0}
                    </span>{" "}
                    following
                  </Link>
                </div>
              </div>
            </div>
            {user && !isOwnProfile && (
              <FollowButton
                followingId={profile.id}
                isFollowing={isFollowing}
                currentUserId={user.id}
              />
            )}
          </div>

          {isOwnProfile && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-700 dark:bg-sky-900/50">
              <p className="text-sm italic text-sky-800 dark:text-sky-200">
                &ldquo;{dailyQuote}&rdquo;
              </p>
            </div>
          )}

          <ul className="mt-4 flex flex-col gap-4">
            {(posts ?? []).map((post) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  content: post.content,
                  created_at: post.created_at,
                  updated_at: post.updated_at,
                  user_id: post.user_id,
                  author: {
                    username: profile.username,
                    display_name: profile.display_name,
                    avatar_url: profile.avatar_url,
                  },
                  posted_date: post.posted_date,
                  posted_period: post.posted_period,
                }}
                heartCount={countByPost[post.id] ?? 0}
                isHearted={heartedPostIds.has(post.id)}
                comments={commentsByPostId[post.id] ?? []}
                currentUserId={user?.id ?? null}
              />
            ))}
          </ul>

          {(!posts || posts.length === 0) && (
            <p className="text-center text-sky-900 dark:text-sky-100">
              No drops yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
