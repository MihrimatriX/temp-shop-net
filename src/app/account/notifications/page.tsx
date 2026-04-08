"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Notification, NotificationSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [list, setList] = useState<Notification[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !user) return;
    setErr(null);
    try {
      const [s, n] = await Promise.all([
        apiFetch<NotificationSummary>("/api/notification/summary", { token }),
        apiFetch<Notification[]>(
          `/api/notification/user/${user.userId}?pageNumber=1&pageSize=50`,
          { token },
        ),
      ]);
      setSummary(unwrap(s));
      setList(unwrap(n));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  }, [token, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const markAll = async () => {
    if (!token) return;
    try {
      await unwrap(
        await apiFetch("/api/notification/mark-all-read", {
          method: "PUT",
          token,
        }),
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const toggleRead = async (id: number, isRead: boolean) => {
    if (!token) return;
    try {
      await unwrap(
        await apiFetch(`/api/notification/${id}`, {
          method: "PUT",
          token,
          body: JSON.stringify({ isRead: !isRead }),
        }),
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Bildirimler
        </h1>
        <Button size="sm" variant="secondary" onClick={markAll}>
          Tümünü okundu işaretle
        </Button>
      </div>
      {summary && (
        <p className="mt-4 text-sm text-[var(--ts-ink-muted)]">
          Toplam {summary.totalNotifications} · Okunmamış{" "}
          {summary.unreadNotifications}
        </p>
      )}
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <ul className="mt-6 space-y-3">
        {list.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border p-4 ${
              n.isRead
                ? "border-[var(--ts-border)] bg-[var(--ts-surface)]"
                : "border-[var(--ts-coral)]/40 bg-[var(--ts-coral)]/5"
            }`}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-[var(--ts-ink-muted)]">{n.message}</p>
            <button
              type="button"
              className="mt-2 text-xs text-[var(--ts-coral)] underline"
              onClick={() => toggleRead(n.id, n.isRead)}
            >
              {n.isRead ? "Okunmadı yap" : "Okundu işaretle"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
