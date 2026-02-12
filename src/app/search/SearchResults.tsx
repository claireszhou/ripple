import Link from "next/link";
import { FollowButton } from "@/components/FollowButton";

type Result = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_following: boolean;
};

export function SearchResults({
  results,
  currentUserId,
}: {
  results: Result[];
  currentUserId: string;
}) {
  if (results.length === 0) {
    return (
      <p className="text-sky-900 dark:text-sky-100">
        No users found. Try a different search.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {results.map((user) => (
        <li
          key={user.id}
          className="flex items-center justify-between rounded-lg border border-sky-200 bg-white p-3 dark:border-sky-800 dark:bg-sky-900"
        >
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-3"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="h-10 w-10 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-200 text-sky-900 dark:bg-sky-700 dark:text-sky-100">
                {(user.display_name ?? user.username ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="font-medium text-sky-900 dark:text-sky-100">
                {user.display_name ?? user.username}
              </span>
              <span className="ml-1 text-sky-600 dark:text-sky-400">
                @{user.username}
              </span>
            </div>
          </Link>
          <FollowButton
            followingId={user.id}
            isFollowing={user.is_following}
            currentUserId={currentUserId}
          />
        </li>
      ))}
    </ul>
  );
}
