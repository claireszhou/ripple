"use client";

type HeartButtonProps = {
  count: number;
  isHearted: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function HeartButton({ count, isHearted, onToggle, disabled }: HeartButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-sky-800"
      aria-pressed={isHearted}
    >
      <svg
        className={`h-5 w-5 ${isHearted ? "fill-red-500 text-red-500" : "fill-none text-sky-900 dark:text-sky-100"}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className={isHearted ? "text-red-500" : "text-sky-900 dark:text-sky-100"}>
        {count}
      </span>
    </button>
  );
}
