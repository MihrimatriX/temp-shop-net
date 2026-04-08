import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { Category } from "@/lib/types";
import { ProductImage } from "@/components/product-image";

export default async function CategoriesPage() {
  const categories = await serverFetch<Category[]>("/api/category");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ts-ink)]">
        Kategoriler
      </h1>
      <p className="mt-2 text-[var(--ts-ink-muted)]">
        Her kategoriye tıklayarak filtrelenmiş ürün listesine git.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(categories ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/products?categoryId=${c.id}`}
            className="overflow-hidden rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-[16/9] bg-[var(--ts-sand)]">
              <ProductImage
                src={c.imageUrl}
                alt={c.categoryName}
                className="h-full w-full"
              />
            </div>
            <div className="p-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ts-ink)]">
                {c.categoryName}
              </h2>
              {c.description && (
                <p className="mt-2 line-clamp-2 text-sm text-[var(--ts-ink-muted)]">
                  {c.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
