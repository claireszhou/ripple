import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import type { Profile } from "@/lib/auth";

export function FeedNav({ profile }: { profile: Profile }) {
  return (
    <nav className="border-b border-sky-200 bg-white dark:border-sky-800 dark:bg-sky-950">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link
          href="/feed"
          className="font-logo text-2xl font-semibold lowercase tracking-wide text-sky-900 dark:text-sky-100"
        >
          ((ripple))
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="text-sky-900 hover:text-sky-800 dark:text-sky-100 dark:hover:text-sky-200"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
          <Link
            href={`/profile/${profile.username}`}
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-sky-200 transition hover:ring-sky-400 dark:ring-sky-600 dark:hover:ring-sky-400"
            aria-label="Profile"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-8 w-8 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center bg-sky-200 text-sm font-medium text-sky-900 dark:bg-sky-700 dark:text-sky-100">
                {(profile.display_name ?? profile.username ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-medium text-sky-900 hover:text-sky-800 dark:text-sky-100 dark:hover:text-sky-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
