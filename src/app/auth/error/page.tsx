import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-xl font-semibold">Authentication error</h1>
      <p className="text-sky-900 dark:text-sky-100">
        Something went wrong during sign in. Please try again.
      </p>
      <Link
        href="/"
        className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-600"
      >
        Back to home
      </Link>
    </div>
  );
}
