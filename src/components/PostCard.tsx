"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HeartButton } from "./HeartButton";
import { CommentSection } from "./CommentSection";

type Author = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: Author;
};

type PostCardProps = {
  post: {
    id: string;
    content: string;
    created_at: string;
    updated_at?: string;
    author: Author;
    user_id?: string;
    posted_date?: string;
    posted_period?: string;
  };
  heartCount: number;
  isHearted: boolean;
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

function formatPostedDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PostCard({
  post,
  heartCount: initialHeartCount,
  isHearted: initialIsHearted,
  comments = [],
  currentUserId,
}: PostCardProps) {
  const [heartCount, setHeartCount] = useState(initialHeartCount);
  const [isHearted, setIsHearted] = useState(initialIsHearted);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOwnPost = currentUserId && post.user_id && post.user_id === currentUserId;

  async function handleDelete() {
    if (!isOwnPost || deleting) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", post.id);
    setMenuOpen(false);
    setDeleting(false);
    router.refresh();
  }

  async function handleSaveEdit() {
    if (!isOwnPost || saving) return;
    const trimmed = editContent.trim();
    if (!trimmed || trimmed.length > 280) return;
    if (trimmed === post.content.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("posts")
      .update({ content: trimmed })
      .eq("id", post.id);
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  function handleCancelEdit() {
    setEditContent(post.content);
    setEditing(false);
  }

  async function toggleHeart() {
    if (!currentUserId) return;
    const supabase = createClient();
    if (isHearted) {
      await supabase
        .from("hearts")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);
      setHeartCount((c) => Math.max(0, c - 1));
      setIsHearted(false);
    } else {
      await supabase.from("hearts").insert({
        post_id: post.id,
        user_id: currentUserId,
      });
      setHeartCount((c) => c + 1);
      setIsHearted(true);
    }
  }

  const username = post.author?.username ?? "unknown";

  const dateLabel =
    post.posted_date ? formatPostedDate(post.posted_date) : null;

  return (
    <li className="relative rounded-lg border border-sky-200 bg-white p-4 dark:border-sky-800 dark:bg-sky-900">
      <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Link
          href={`/profile/${username}`}
          className="flex shrink-0 items-center gap-2"
        >
          {post.author?.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt=""
              className="h-10 w-10 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-200 text-sky-900 dark:bg-sky-700 dark:text-sky-100">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-sky-600 dark:text-sky-400">
            @{username}
          </span>
        </Link>
        {(dateLabel || (post.updated_at && new Date(post.updated_at).getTime() - new Date(post.created_at).getTime() > 1000)) && (
          <>
            <span className="text-sky-900 dark:text-sky-100">·</span>
            <span className="text-sm text-sky-900 dark:text-sky-100">
              {dateLabel}
              {post.updated_at && new Date(post.updated_at).getTime() - new Date(post.created_at).getTime() > 1000 && (
                <>{dateLabel ? " " : ""}<span className="text-sky-600 dark:text-sky-400">(edited)</span></>
              )}
            </span>
          </>
        )}
      </div>
      {isOwnPost && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-0.5 rounded p-1 text-sky-900 hover:bg-sky-100 dark:text-sky-100 dark:hover:bg-sky-800"
            aria-label="Options"
          >
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 flex rounded-lg border border-sky-200 bg-white py-1 shadow-lg dark:border-sky-700 dark:bg-sky-900">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
                className="flex items-center justify-center px-3 py-2 text-sky-900 hover:bg-sky-50 dark:text-sky-100 dark:hover:bg-sky-800"
                aria-label="Edit"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-sky-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-sky-800"
                aria-label="Delete"
              >
                {deleting ? (
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
      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            maxLength={280}
            className="w-full rounded-lg border border-sky-300 bg-white px-4 py-3 text-sky-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-sky-600 dark:bg-sky-800 dark:text-sky-100"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving || !editContent.trim() || editContent.length > 280}
              className="rounded bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="rounded border border-sky-300 px-3 py-1.5 text-sm font-medium text-sky-900 hover:bg-sky-50 dark:border-sky-600 dark:text-sky-100 dark:hover:bg-sky-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sky-900 dark:text-sky-100">
          {post.content}
        </p>
      )}
      <div className="mt-3 flex items-center gap-4">
        <span className="text-xs text-sky-900 dark:text-sky-100">
          {formatDate(post.created_at)}
        </span>
        <HeartButton
          count={heartCount}
          isHearted={isHearted}
          onToggle={toggleHeart}
          disabled={!currentUserId}
        />
      </div>
      <CommentSection
        postId={post.id}
        comments={comments}
        currentUserId={currentUserId}
      />
    </li>
  );
}
