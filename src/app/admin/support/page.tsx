"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { SupportTicket } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/input";

export default function AdminSupportPage() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [contact, setContact] = useState({
    name: "Panel test",
    email: "test@example.com",
    phone: "",
    subject: "İletişim formu testi",
    message: "Yönetim panelinden gönderilen test mesajı.",
    category: "General",
  });

  const loadTickets = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    setErr(null);
    try {
      const r = await apiFetch<SupportTicket[]>(
        `/api/helpsupport/tickets/admin?pageNumber=${page}&pageSize=15`,
        { token },
      );
      setTickets(unwrap(r));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Talepler yüklenemedi");
    }
  }, [token, user?.isAdmin, page]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const sendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await unwrap(
        await apiFetch<string>("/api/helpsupport/contact", {
          method: "POST",
          body: JSON.stringify(contact),
        }),
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "İletişim gönderilemedi");
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Destek talepleri
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          <code className="rounded bg-[var(--ts-sand)] px-1">
            GET /api/helpsupport/tickets/admin
          </code>
        </p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Tüm talepler</h2>
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
          {tickets.map((t) => (
            <li
              key={t.id}
              className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-4 text-sm shadow-sm"
            >
              <div className="flex flex-wrap gap-2 font-medium">
                <span>#{t.id}</span>
                <span>{t.subject}</span>
                <span className="text-[var(--mp-text-muted)]">
                  {t.status} · {t.priority}
                </span>
              </div>
              <p className="mt-1 text-[var(--mp-text-muted)]">
                Kullanıcı: {t.userName} (id {t.userId})
              </p>
              <p className="mt-2 text-[var(--mp-text)]">{t.description}</p>
              {t.messages?.length ? (
                <ul className="mt-2 border-t border-[var(--mp-border)] pt-2 text-[var(--mp-text-muted)]">
                  {t.messages.map((m) => (
                    <li key={m.id}>
                      {m.isFromSupport ? "[Destek] " : ""}
                      {m.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
        {tickets.length === 0 && !err && (
          <p className="mt-4 text-sm text-[var(--mp-text-muted)]">Kayıt yok.</p>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">İletişim formu (test)</h2>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          <code className="rounded bg-[var(--ts-sand)] px-1">
            POST /api/helpsupport/contact
          </code>{" "}
          — kimlik doğrulama gerekmez.
        </p>
        <form onSubmit={sendContact} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Ad</Label>
            <Input
              value={contact.name}
              onChange={(e) =>
                setContact((c) => ({ ...c, name: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>E-posta</Label>
            <Input
              type="email"
              value={contact.email}
              onChange={(e) =>
                setContact((c) => ({ ...c, email: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Konu</Label>
            <Input
              value={contact.subject}
              onChange={(e) =>
                setContact((c) => ({ ...c, subject: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Mesaj</Label>
            <TextArea
              rows={3}
              value={contact.message}
              onChange={(e) =>
                setContact((c) => ({ ...c, message: e.target.value }))
              }
            />
          </div>
          <Button type="submit" size="sm">
            Gönder
          </Button>
        </form>
      </section>
    </div>
  );
}
