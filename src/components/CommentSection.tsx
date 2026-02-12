"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createComment, deleteComment } from "@/app/actions/comments";

type CommentAuthor = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: CommentAuthor;
};

type CommentSectionProps = {
  postId: string;
  comments: Comment[];
  currentUserId: string | null;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h`;
  if (diff < 604800_000) return `${Math.floor(diff / 86400_000)}d`;
  return d.toLocaleDateString();
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
  const [optimisticallyDeletedIds, setOptimisticallyDeletedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOptimisticComments((prev) =>
      prev.filter((opt) => {
        const match = comments.find(
          (c) => c.content === opt.content && Math.abs(new Date(c.created_at).getTime() - new Date(opt.created_at).getTime()) < 10000
        );
        return !match;
      })
    );
    setOptimisticallyDeletedIds((prev) => {
      const commentIds = new Set(comments.map((c) => c.id));
      return new Set([...prev].filter((id) => commentIds.has(id)));
    });
  }, [comments]);

  async function handleDelete(commentId: string) {
    if (!currentUserId || deletingId) return;
    setDeletingId(commentId);
    setError(null);
    setOptimisticallyDeletedIds((prev) => new Set(prev).add(commentId));
    try {
      await deleteComment(commentId);
      router.refresh();
    } catch (err) {
      setOptimisticallyDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
      setError(err instanceof Error ? err.message : "Failed to delete ripple");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;
    setError(null);
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 280) {
      setError("Ripple must be 1–280 characters");
      return;
    }

    setContent("");
    setLoading(true);
    const optimistic: Comment = {
      id: `opt-${Date.now()}`,
      user_id: currentUserId,
      content: trimmed,
      created_at: new Date().toISOString(),
      author: { username: null, display_name: null, avatar_url: null },
    };
    setOptimisticComments((prev) => [...prev, optimistic]);

    try {
      await createComment(postId, trimmed);
      router.refresh();
    } catch (err) {
      setOptimisticComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setContent(trimmed);
      setError(err instanceof Error ? err.message : "Failed to add ripple");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 border-t border-sky-200 pt-3 dark:border-sky-700">
      <ul className="space-y-2">
        {[...optimisticComments, ...comments]
          .filter((c) => !optimisticallyDeletedIds.has(c.id))
          .map((c) => (
          <li key={c.id} className="text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {c.author.username ? (
                  <Link
                    href={`/profile/${c.author.username}`}
                    className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                  >
                    @{c.author.username}
                  </Link>
                ) : (
                  <span className="font-medium text-sky-600 dark:text-sky-400">You</span>
                )}
                <span className="text-sky-900 dark:text-sky-100">
                  {formatDate(c.created_at)}
                </span>
              </div>
              {currentUserId && c.user_id === currentUserId && (
                <div className="relative shrink-0" ref={openMenuId === c.id ? menuRef : undefined}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                    className="flex flex-col gap-0.5 rounded p-1 text-sky-900 hover:bg-sky-100 dark:text-sky-100 dark:hover:bg-sky-800"
                    aria-label="Options"
                  >
                    <span className="block h-0.5 w-3 rounded-full bg-current" />
                    <span className="block h-0.5 w-3 rounded-full bg-current" />
                    <span className="block h-0.5 w-3 rounded-full bg-current" />
                  </button>
                  {openMenuId === c.id && (
                    <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-sky-200 bg-white py-1 shadow-lg dark:border-sky-700 dark:bg-sky-900">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          handleDelete(c.id);
                        }}
                        disabled={deletingId === c.id}
                        className="flex w-full items-center justify-center px-3 py-2 text-red-600 hover:bg-sky-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-sky-800"
                      >
                        {deletingId === c.id ? (
                          <span className="text-sm">…</span>
                        ) : (
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-0.5 text-sky-900 dark:text-sky-100">{c.content}</p>
          </li>
        ))}
      </ul>
      {currentUserId && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a ripple..."
            maxLength={280}
            className="flex-1 rounded border border-sky-300 bg-white px-3 py-2 text-sm text-sky-900 placeholder:text-sky-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-sky-600 dark:bg-sky-800 dark:text-sky-100 dark:placeholder:text-sky-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center justify-center rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-sky-500 dark:text-white"
          >
            {loading ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-label="Loading">
                <circle cx="12" cy="12" r="10" />
              </svg>
            ) : (
              "+"
            )}
          </button>
        </form>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
