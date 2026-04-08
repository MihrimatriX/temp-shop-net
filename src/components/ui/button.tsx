import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary:
    "bg-[var(--mp-orange)] text-white hover:bg-[var(--mp-orange-hover)] shadow-sm border border-transparent",
  secondary:
    "bg-[var(--mp-surface)] text-[var(--mp-text)] border border-[var(--mp-border)] hover:bg-[var(--mp-bg)]",
  ghost:
    "text-[var(--mp-text-muted)] hover:bg-[var(--mp-bg)] border border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mp-orange)] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
}
