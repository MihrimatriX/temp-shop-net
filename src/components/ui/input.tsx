import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] px-3 py-2.5 text-sm text-[var(--ts-ink)] placeholder:text-[var(--ts-ink-faint)] focus:border-[var(--ts-coral)] focus:outline-none focus:ring-1 focus:ring-[var(--ts-coral)] ${className}`}
      {...rest}
    />
  );
}

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--ts-ink-muted)]"
    >
      {children}
    </label>
  );
}

export function TextArea({
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] px-3 py-2.5 text-sm text-[var(--ts-ink)] placeholder:text-[var(--ts-ink-faint)] focus:border-[var(--ts-coral)] focus:outline-none focus:ring-1 focus:ring-[var(--ts-coral)] ${className}`}
      {...rest}
    />
  );
}

export function Select({
  className = "",
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] px-3 py-2.5 text-sm text-[var(--ts-ink)] focus:border-[var(--ts-coral)] focus:outline-none focus:ring-1 focus:ring-[var(--ts-coral)] ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
