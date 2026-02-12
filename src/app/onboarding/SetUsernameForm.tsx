"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SetUsernameForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(normalized)) {
      setError("Use 3–30 characters: lowercase letters, numbers, underscores");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: normalized, updated_at: new Date().toISOString() })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    setLoading(false);

    if (updateError) {
      if (updateError.code === "23505") {
        setError("That username is already taken");
      } else {
        setError(updateError.message);
      }
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
        className="rounded-lg border border-sky-300 bg-white px-4 py-3 text-sky-900 placeholder:text-sky-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-sky-600 dark:bg-sky-900 dark:text-sky-100 dark:placeholder:text-sky-400"
        autoComplete="username"
        disabled={loading}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-sky-900 px-4 py-3 font-medium text-white hover:bg-sky-700 disabled:opacity-50 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-600"
      >
        {loading ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
