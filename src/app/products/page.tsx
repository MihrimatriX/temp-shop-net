import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { Category, PagedProducts } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

type Props = {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const qs = new URLSearchParams();
  if (sp.q) qs.set("searchTerm", sp.q);
  if (sp.categoryId) qs.set("categoryId", sp.categoryId);
  qs.set("pageNumber", String(page));
  qs.set("pageSize", "24");
  qs.set("sortBy", sp.sortBy || "Id");
  qs.set("sortOrder", sp.sortOrder || "asc");

  const [data, categories] = await Promise.all([
    serverFetch<PagedProducts>(`/api/product?${qs.toString()}`),
    serverFetch<Category[]>("/api/category"),
  ]);

  const buildLink = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    if (merged.q) p.set("q", merged.q);
    if (merged.categoryId) p.set("categoryId", merged.categoryId);
    if (merged.page && merged.page !== "1") p.set("page", merged.page);
    if (merged.sortBy && merged.sortBy !== "Id") p.set("sortBy", merged.sortBy);
    if (merged.sortOrder && merged.sortOrder !== "asc")
      p.set("sortOrder", merged.sortOrder);
    const s = p.toString();
    return s ? `/products?${s}` : "/products";
  };

  return (
    <div className="bg-[var(--mp-bg)] pb-12">
      <div className="border-b border-[var(--mp-border)] bg-[var(--mp-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-extrabold text-[var(--mp-text)]">
            Ürünler
          </h1>
          <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
            Arama, kategori ve sıralama ile milyonlarca ürün arasından seç — API
            ile canlı.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <form
          className="grid gap-4 rounded-lg border border-[var(--mp-border)] bg-[var(--mp-surface)] p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
          action="/products"
          method="get"
        >
          <div className="min-w-0 lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-[var(--mp-text-muted)]">
              Arama
            </label>
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Ürün veya marka ara"
              className="w-full rounded-md border border-[var(--mp-border)] px-3 py-2.5 text-sm outline-none ring-[var(--mp-orange)] focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--mp-text-muted)]">
              Kategori
            </label>
            <select
              name="categoryId"
              defaultValue={sp.categoryId || ""}
              className="w-full rounded-md border border-[var(--mp-border)] px-3 py-2.5 text-sm"
            >
              <option value="">Tüm kategoriler</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--mp-text-muted)]">
              Sırala
            </label>
            <select
              name="sortBy"
              defaultValue={sp.sortBy || "Id"}
              className="w-full rounded-md border border-[var(--mp-border)] px-3 py-2.5 text-sm"
            >
              <option value="Id">Önerilen</option>
              <option value="ProductName">İsme göre</option>
              <option value="UnitPrice">Fiyata göre</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--mp-text-muted)]">
              Yön
            </label>
            <select
              name="sortOrder"
              defaultValue={sp.sortOrder || "asc"}
              className="w-full rounded-md border border-[var(--mp-border)] px-3 py-2.5 text-sm"
            >
              <option value="asc">Artan</option>
              <option value="desc">Azalan</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-[var(--mp-orange)] py-2.5 text-sm font-bold text-white transition hover:bg-[var(--mp-orange-hover)]"
            >
              Listele
            </button>
          </div>
        </form>

        {!data || data.items.length === 0 ? (
          <p className="mt-12 text-center text-[var(--mp-text-muted)]">
            Ürün bulunamadı.
          </p>
        ) : (
          <>
            <p className="mt-6 text-sm text-[var(--mp-text-muted)]">
              <strong className="text-[var(--mp-text)]">
                {data.totalCount}
              </strong>{" "}
              ürün · Sayfa <strong>{data.pageNumber}</strong> /{" "}
              {data.totalPages}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-10 flex justify-center gap-3">
              {data.hasPreviousPage && (
                <Link
                  href={buildLink({ page: String(page - 1) })}
                  className="rounded-md border border-[var(--mp-border)] bg-[var(--mp-surface)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--mp-orange)]"
                >
                  ← Önceki
                </Link>
              )}
              {data.hasNextPage && (
                <Link
                  href={buildLink({ page: String(page + 1) })}
                  className="rounded-md border border-[var(--mp-border)] bg-[var(--mp-surface)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--mp-orange)]"
                >
                  Sonraki →
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
