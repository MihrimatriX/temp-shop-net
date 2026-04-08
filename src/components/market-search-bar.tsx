"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

type Props = {
  className?: string;
  placeholder?: string;
  defaultQuery?: string;
};

export function MarketSearchBar({
  className = "",
  placeholder = "Ürün, kategori veya marka ara",
  defaultQuery = "",
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    const path = params.toString() ? `/products?${params}` : "/products";
    router.push(path);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full max-w-2xl items-stretch overflow-hidden rounded-md border-2 border-[var(--mp-orange)] bg-[var(--mp-surface)] shadow-sm ${className}`}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 px-4 py-2.5 text-sm text-[var(--mp-text)] outline-none placeholder:text-[var(--mp-text-faint)]"
        autoComplete="off"
        name="q"
      />
      <button
        type="submit"
        className="flex shrink-0 items-center gap-2 bg-[var(--mp-orange)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mp-orange-hover)]"
      >
        <Search className="h-4 w-4" aria-hidden />
        Ara
      </button>
    </form>
  );
}
