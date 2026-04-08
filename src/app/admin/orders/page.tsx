"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/components/price";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    setErr(null);
    try {
      const o = await apiFetch<Order[]>("/api/order/admin?pageSize=100", {
        token,
      });
      const ol = unwrap(o);
      setOrders(ol);
      const sm: Record<number, string> = {};
      ol.forEach((x) => {
        sm[x.id] = x.status;
      });
      setStatusMap(sm);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Yüklenemedi");
    }
  }, [token, user?.isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateOrderStatus = async (id: number) => {
    if (!token) return;
    const status = statusMap[id];
    try {
      await unwrap(
        await apiFetch<Order>(`/api/order/${id}/status`, {
          method: "PUT",
          token,
          body: JSON.stringify({ status, notes: "" }),
        }),
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Siparişler
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          Tüm siparişler ve durum güncellemesi.
        </p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="space-y-4">
        {orders.map((o) => (
          <li
            key={o.id}
            className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-4 text-sm shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono font-medium">{o.orderNumber}</span>
              <span className="font-semibold">
                {formatMoney(o.totalAmount)}
              </span>
              <select
                className="rounded-lg border border-[var(--mp-border)] bg-[var(--mp-surface)] px-2 py-1.5"
                value={statusMap[o.id] ?? o.status}
                onChange={(e) =>
                  setStatusMap((m) => ({ ...m, [o.id]: e.target.value }))
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={() => updateOrderStatus(o.id)}>
                Durumu kaydet
              </Button>
            </div>
            <p className="mt-2 text-[var(--mp-text-muted)]">{o.userEmail}</p>
          </li>
        ))}
      </ul>
      {orders.length === 0 && !err && (
        <p className="text-sm text-[var(--mp-text-muted)]">Kayıt yok.</p>
      )}
    </div>
  );
}
