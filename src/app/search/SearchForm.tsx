"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { searchUsers, type SearchResult } from "@/app/actions/search";
import { FollowButton } from "@/components/FollowButton";

export function SearchForm({
  initialQuery,
  currentUserId,
}: {
  initialQuery: string;
  currentUserId: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchUsers(q, currentUserId);
        setResults(data);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery.trim()) runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch(query);
      setShowDropdown(true);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative mb-6">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setShowDropdown(true)}
        placeholder="Search by username..."
        className="w-full rounded border border-sky-300 bg-white px-3 py-2 text-sm text-sky-900 placeholder:text-sky-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-sky-600 dark:bg-sky-800 dark:text-sky-100 dark:placeholder:text-sky-100"
        autoComplete="off"
      />
      {showDropdown && (results.length > 0 || !loading) && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto rounded-lg border border-sky-200 bg-white shadow-lg dark:border-sky-700 dark:bg-sky-900">
          {results.length === 0 && !loading ? (
            <li className="px-4 py-3 text-sm text-sky-500">No users found</li>
          ) : (
            results.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between border-b border-sky-100 last:border-0 dark:border-sky-800"
              >
                <Link
                  href={`/profile/${user.username}`}
                  className="flex flex-1 items-center gap-3 px-3 py-2 hover:bg-sky-50 dark:hover:bg-sky-800/50"
                  onClick={() => setShowDropdown(false)}
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
                <div className="px-2 py-1" onClick={(e) => e.preventDefault()}>
                  <FollowButton
                    followingId={user.id}
                    isFollowing={user.is_following}
                    currentUserId={currentUserId}
                  />
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
