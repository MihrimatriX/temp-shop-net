"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Campaign, Category, Order, PagedProducts } from "@/lib/types";

type Stats = {
  orderCount: number;
  productTotal: number;
  categoryCount: number;
  campaignCount: number;
};

export default function AdminDashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    setErr(null);
    try {
      const [o, p, c, camp] = await Promise.all([
        apiFetch<Order[]>("/api/order/admin?pageSize=500", { token }),
        apiFetch<PagedProducts>("/api/product?pageNumber=1&pageSize=1", {}),
        apiFetch<Category[]>("/api/category", { token }),
        apiFetch<Campaign[]>("/api/campaign", {}),
      ]);
      setStats({
        orderCount: unwrap(o).length,
        productTotal: unwrap(p).totalCount,
        categoryCount: unwrap(c).length,
        campaignCount: unwrap(camp).length,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Özet yüklenemedi");
    }
  }, [token, user?.isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Özet
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          Mağaza ve siparişlere hızlı bakış.
        </p>
      </div>

      {err && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Sipariş (liste)",
            value: stats?.orderCount ?? "—",
            href: "/admin/orders",
          },
          {
            label: "Ürün (toplam)",
            value: stats?.productTotal ?? "—",
            href: "/admin/catalog",
          },
          {
            label: "Kategori",
            value: stats?.categoryCount ?? "—",
            href: "/admin/catalog",
          },
          {
            label: "Aktif kampanya",
            value: stats?.campaignCount ?? "—",
            href: "/admin/campaigns",
          },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mp-text-faint)]">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--mp-text)]">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6">
        <h2 className="text-sm font-semibold text-[var(--mp-text)]">
          Kısayollar
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {(
            [
              ["/admin/catalog", "Katalog"],
              ["/admin/campaigns", "Kampanya"],
              ["/admin/notifications", "Bildirim"],
              ["/admin/help", "Yardım makalesi"],
              ["/admin/support", "Destek talepleri"],
              ["/admin/reviews", "Yorumlar"],
              ["/admin/system", "Sistem / API"],
            ] as const
          ).map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-lg bg-[var(--mp-bg)] px-3 py-1.5 font-medium text-[var(--mp-text)] hover:bg-[var(--mp-orange-soft)]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
