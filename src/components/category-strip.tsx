import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { Category } from "@/lib/types";

export async function CategoryStrip() {
  const categories = await serverFetch<Category[]>("/api/category");
  if (!categories?.length) {
    return null;
  }

  return (
    <nav
      className="mp-scroll border-t border-black/10 bg-[var(--mp-orange)] text-white"
      aria-label="Kategoriler"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-2 py-2 sm:px-4">
        <Link
          href="/products"
          className="shrink-0 rounded px-3 py-1.5 text-xs font-bold tracking-wide text-white hover:bg-white/15"
        >
          TÜMÜ
        </Link>
        {categories.slice(0, 18).map((c) => (
          <Link
            key={c.id}
            href={`/products?categoryId=${c.id}`}
            className="shrink-0 rounded px-3 py-1.5 text-xs font-semibold whitespace-nowrap hover:bg-white/15"
          >
            {c.categoryName}
          </Link>
        ))}
        <Link
          href="/categories"
          className="shrink-0 rounded px-3 py-1.5 text-xs font-semibold underline decoration-white/50 hover:bg-white/15"
        >
          Daha fazla →
        </Link>
      </div>
    </nav>
  );
}
