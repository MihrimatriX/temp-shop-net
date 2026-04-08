import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { SubCategory } from "@/lib/types";

export default async function SubCategoriesPage() {
  const subs = await serverFetch<SubCategory[]>("/api/subcategory");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ts-ink)]">
        Alt kategoriler
      </h1>
      <p className="mt-2 text-[var(--ts-ink-muted)]">
        <code className="rounded bg-[var(--ts-sand)] px-1">
          GET /api/subcategory
        </code>
      </p>
      <ul className="mt-8 space-y-3">
        {(subs ?? []).map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] px-4 py-3"
          >
            <span className="font-medium text-[var(--ts-ink)]">
              {s.subCategoryName}
            </span>
            <Link
              href={`/products?categoryId=${s.categoryId}`}
              className="text-sm text-[var(--ts-coral)] hover:underline"
            >
              {s.categoryName} ürünleri
            </Link>
          </li>
        ))}
      </ul>
      {!subs?.length && (
        <p className="mt-8 text-[var(--ts-ink-muted)]">Kayıt yok.</p>
      )}
    </div>
  );
}
