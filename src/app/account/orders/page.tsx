"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Order } from "@/lib/types";
import { formatMoney } from "@/components/price";

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const r = await apiFetch<Order[]>("/api/order", { token });
      setOrders(unwrap(r));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Yüklenemedi");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (id: number) => {
    if (!token) return;
    try {
      await unwrap(
        await apiFetch(`/api/order/${id}/cancel`, { method: "PUT", token }),
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "İptal edilemedi");
    }
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ts-ink)]">
        Siparişlerim
      </h1>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <ul className="mt-6 space-y-4">
        {orders.map((o) => (
          <li
            key={o.id}
            className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-sm text-[var(--ts-ink-muted)]">
                  {o.orderNumber}
                </p>
                {(o.subtotalAmount != null || o.shippingFee != null) && (
                  <div className="mt-1 space-y-0.5 text-xs text-[var(--ts-ink-muted)]">
                    {o.subtotalAmount != null && (
                      <p>Ara toplam: {formatMoney(o.subtotalAmount)}</p>
                    )}
                    {o.shippingFee != null && (
                      <p>
                        Kargo:{" "}
                        {o.shippingFee <= 0
                          ? "Ücretsiz"
                          : formatMoney(o.shippingFee)}
                      </p>
                    )}
                  </div>
                )}
                <p className="mt-1 font-semibold text-[var(--ts-ink)]">
                  Toplam: {formatMoney(o.totalAmount)}
                </p>
                <p className="text-sm text-[var(--ts-ink-muted)]">
                  Durum: {o.status}
                </p>
              </div>
              {o.status !== "Cancelled" && o.status !== "Delivered" && (
                <button
                  type="button"
                  onClick={() => cancel(o.id)}
                  className="text-sm text-red-600 underline"
                >
                  İptal
                </button>
              )}
            </div>
            <ul className="mt-3 space-y-1 text-sm text-[var(--ts-ink-muted)]">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.productName} × {i.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {orders.length === 0 && !err && (
        <p className="mt-8 text-[var(--ts-ink-muted)]">Henüz sipariş yok.</p>
      )}
      <Link
        href="/products"
        className="mt-6 inline-block text-sm text-[var(--ts-coral)] underline"
      >
        Alışverişe devam
      </Link>
    </div>
  );
}
