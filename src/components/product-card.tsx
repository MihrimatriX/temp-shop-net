import Link from "next/link";
import { ProductImage } from "./product-image";
import { PriceTag } from "./price";
import type { Product } from "@/lib/types";
import { Star, Truck } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const hasDisc = product.discount > 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded border border-[var(--mp-border)] bg-[var(--mp-surface)] transition hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--mp-bg)]">
        {hasDisc && (
          <span className="absolute left-2 top-2 z-10 rounded bg-[var(--mp-orange)] px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            %{product.discount}
          </span>
        )}
        <ProductImage
          src={product.imageUrl}
          alt={product.productName}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.categoryName && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--mp-text-faint)]">
            {product.categoryName}
          </span>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-[var(--mp-text)]">
          {product.productName}
        </h3>
        {product.averageRating != null && product.totalReviews != null && (
          <div className="flex items-center gap-1 text-xs text-[var(--mp-text-muted)]">
            <Star className="h-3.5 w-3.5 fill-[var(--mp-star)] text-[var(--mp-star)]" />
            <span className="font-semibold text-[var(--mp-text)]">
              {product.averageRating.toFixed(1)}
            </span>
            <span>({product.totalReviews})</span>
          </div>
        )}
        <PriceTag product={product} />
        <p className="mt-auto flex items-center gap-1 pt-1 text-[11px] font-medium text-[var(--mp-success)]">
          <Truck className="h-3.5 w-3.5" />
          Hızlı kargo
        </p>
      </div>
    </Link>
  );
}
