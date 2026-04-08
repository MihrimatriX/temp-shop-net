import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import type { Product, ProductReviewSummary, Review } from "@/lib/types";
import { ProductDetailClient } from "./product-detail-client";
import { ProductImage } from "@/components/product-image";
import { PriceTag } from "@/components/price";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const pid = parseInt(id, 10);
  if (!Number.isFinite(pid)) notFound();

  const [product, reviews, summary] = await Promise.all([
    serverFetch<Product>(`/api/product/${pid}`),
    serverFetch<Review[]>(`/api/review/product/${pid}`),
    serverFetch<ProductReviewSummary>(`/api/review/product/${pid}/summary`),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-[var(--ts-border)] bg-[var(--ts-surface)]">
          <ProductImage
            src={product.imageUrl}
            alt={product.productName}
            className="aspect-square w-full"
          />
        </div>
        <div>
          {product.categoryName && (
            <Link
              href={`/products?categoryId=${product.categoryId}`}
              className="text-sm font-medium text-[var(--ts-coral)] hover:underline"
            >
              {product.categoryName}
            </Link>
          )}
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ts-ink)]">
            {product.productName}
          </h1>
          <div className="mt-4">
            <PriceTag product={product} />
          </div>
          {summary && (
            <p className="mt-3 text-sm text-[var(--ts-ink-muted)]">
              Ortalama {summary.averageRating.toFixed(1)} ·{" "}
              {summary.totalReviews} değerlendirme
            </p>
          )}
          <p className="mt-4 text-sm text-[var(--ts-ink-muted)]">
            Stok: {product.unitInStock} {product.quantityPerUnit}
          </p>
          {product.description && (
            <p className="mt-6 leading-relaxed text-[var(--ts-ink)]">
              {product.description}
            </p>
          )}
          <ProductDetailClient product={product} />
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Yorumlar
        </h2>
        {!reviews || reviews.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--ts-ink-muted)]">
            Henüz yorum yok. Giriş yaparak ilk yorumu sen yaz.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[var(--ts-ink)]">
                    {r.userName || `Kullanıcı #${r.userId}`}
                  </span>
                  <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                </div>
                {r.title && (
                  <p className="mt-1 text-sm font-semibold">{r.title}</p>
                )}
                {r.comment && (
                  <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
                    {r.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
