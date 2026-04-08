"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Favorite } from "@/lib/types";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/components/price";

export default function FavoritesPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Favorite[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await apiFetch<Favorite[]>("/api/favorite", { token });
      setList(unwrap(r));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (productId: number) => {
    if (!token) return;
    try {
      await unwrap(
        await apiFetch(`/api/favorite/remove/${productId}`, {
          method: "DELETE",
          token,
        }),
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Kaldırılamadı");
    }
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Favoriler
      </h1>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <ul className="mt-6 space-y-4">
        {list.map((f) => (
          <li
            key={f.id}
            className="flex gap-4 rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4"
          >
            <ProductImage
              src={f.productImageUrl}
              alt={f.productName}
              className="h-20 w-20 rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${f.productId}`}
                className="font-medium hover:underline"
              >
                {f.productName}
              </Link>
              <p className="text-sm text-[var(--ts-ink-muted)]">
                {formatMoney(f.productPrice)}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => remove(f.productId)}
              >
                Kaldır
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && !err && (
        <p className="mt-8 text-[var(--ts-ink-muted)]">Favori yok.</p>
      )}
    </div>
  );
}
