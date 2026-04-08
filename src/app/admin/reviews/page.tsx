"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AdminReviewsPage() {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState("");
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const loadAdmin = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    setErr(null);
    try {
      const r = await apiFetch<Review[]>(
        `/api/review/admin?pageNumber=${page}&pageSize=30`,
        { token },
      );
      setReviews(unwrap(r));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Yorumlar yüklenemedi");
    }
  }, [token, user?.isAdmin, page]);

  useEffect(() => {
    void loadAdmin();
  }, [loadAdmin]);

  const loadByProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(productId, 10);
    if (!Number.isFinite(id) || !token) return;
    setErr(null);
    try {
      const r = await apiFetch<Review[]>(`/api/review/product/${id}`, {
        token,
      });
      setProductReviews(unwrap(r));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ürün yorumları alınamadı");
    }
  };

  const remove = async (id: number) => {
    if (!token) return;
    if (!window.confirm("Bu yorumu silmek istiyor musunuz?")) return;
    try {
      await unwrap(
        await apiFetch(`/api/review/${id}`, { method: "DELETE", token }),
      );
      await loadAdmin();
      setProductReviews((list) => list.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Silinemedi");
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Yorumlar
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          <code className="rounded bg-[var(--ts-sand)] px-1">
            GET /api/review/admin
          </code>
          ,{" "}
          <code className="rounded bg-[var(--ts-sand)] px-1">
            GET /api/review/product/{"{id}"}
          </code>
          ,{" "}
          <code className="rounded bg-[var(--ts-sand)] px-1">
            DELETE /api/review/{"{id}"}
          </code>
        </p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Son yorumlar (admin)</h2>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Önceki
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setPage((p) => p + 1)}
            >
              Sonraki
            </Button>
          </div>
        </div>
        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-3 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="font-medium">{r.productName}</span> — puan{" "}
                  {r.rating}
                  <p className="text-[var(--mp-text-muted)]">{r.userName}</p>
                  {r.title && <p className="mt-1 font-medium">{r.title}</p>}
                  {r.comment && <p className="mt-1">{r.comment}</p>}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => remove(r.id)}
                >
                  Sil
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Ürüne göre yorumlar</h2>
        <form
          onSubmit={loadByProduct}
          className="mt-4 flex flex-wrap items-end gap-2"
        >
          <div>
            <Label>Ürün ID</Label>
            <Input
              className="w-32"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Yükle
          </Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {productReviews.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-[var(--mp-border)] px-3 py-2"
            >
              <div className="flex justify-between gap-2">
                <span>
                  {r.userName} — {r.rating}★ {r.title}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => remove(r.id)}
                >
                  Sil
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
