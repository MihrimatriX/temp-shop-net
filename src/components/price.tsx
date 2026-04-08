import { effectiveUnitPrice } from "@/lib/api";
import type { Product } from "@/lib/types";

export function formatMoney(n: number, currency = "TRY") {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ₺`;
  }
}

export function PriceTag({
  product,
}: {
  product: Pick<Product, "unitPrice" | "discount">;
}) {
  const finalPrice = effectiveUnitPrice(product);
  const hasDisc = product.discount > 0;
  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <span className="text-lg font-extrabold text-[var(--mp-orange)]">
        {formatMoney(finalPrice)}
      </span>
      {hasDisc && (
        <span className="text-xs text-[var(--mp-text-muted)] line-through">
          {formatMoney(product.unitPrice)}
        </span>
      )}
    </div>
  );
}
