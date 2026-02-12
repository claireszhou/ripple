"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/posts";

const MAX_LENGTH = 280;

type UsedSlot = { posted_date: string; posted_period: string };

export function CreatePostForm({
  usedSlots = [],
}: {
  usedSlots?: UsedSlot[];
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const today = now.toLocaleDateString("en-CA");
  const period: "AM" | "PM" = now.getHours() < 12 ? "AM" : "PM";
  const slotUsed = usedSlots.some(
    (s) => s.posted_date === today && s.posted_period === period
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_LENGTH) {
      setError(`Drop must be 1–${MAX_LENGTH} characters`);
      return;
    }

    setLoading(true);
    try {
      await createPost(trimmed, today, period);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to drop");
    } finally {
      setLoading(false);
    }
  }

  if (slotUsed) {
    return (
      <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-6 text-center dark:border-sky-800 dark:bg-sky-900/50">
        <p className="text-sky-900 dark:text-sky-100 italic">
          {period === "AM"
            ? "This morning's gratitude has been offered."
            : "This evening's gratitude has been offered."}
        </p>
        <p className="mt-1 text-sm text-sky-900 dark:text-sky-100">
          {period === "AM"
            ? "Rest in it. Return at dusk."
            : "Carry it with you. Return at dawn."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={period === "AM" ? "What are you grateful for this morning?" : "What are you grateful for this evening?"}
        rows={3}
        maxLength={MAX_LENGTH + 50}
        className="rounded-lg border border-sky-300 bg-white px-4 py-3 text-sky-900 placeholder:text-sky-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-sky-600 dark:bg-sky-900 dark:text-sky-100 dark:placeholder:text-sky-400"
        disabled={loading}
      />
      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${
            content.length > MAX_LENGTH ? "text-red-600 dark:text-red-400" : "text-sky-900 dark:text-sky-100"
          }`}
        >
          {content.length}/{MAX_LENGTH}
        </span>
        <button
          type="submit"
          disabled={loading || !content.trim() || content.length > MAX_LENGTH}
          className="rounded bg-sky-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-sky-500 dark:text-white"
        >
          {loading ? "Dropping…" : "Drop"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
