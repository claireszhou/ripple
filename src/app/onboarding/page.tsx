import { requireAuth } from "@/lib/auth";
import { SetUsernameForm } from "./SetUsernameForm";

export default async function OnboardingPage() {
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Choose your username</h1>
          <p className="mt-2 text-sky-900 dark:text-sky-100">
            This is how friends will find you. Use lowercase letters, numbers,
            and underscores only (3–30 characters).
          </p>
        </div>
        <SetUsernameForm />
      </div>
    </div>
  );
}
