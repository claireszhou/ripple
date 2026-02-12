import { requireAuth, getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SearchForm } from "./SearchForm";
import { FeedNav } from "../feed/FeedNav";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  if (!profile?.username) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();

  return (
    <div className="min-h-screen">
      <FeedNav profile={profile} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold">Search users</h1>
        <SearchForm initialQuery={query} currentUserId={user.id} />
      </main>
    </div>
  );
}
