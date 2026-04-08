"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { SupportTicket } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/input";

export default function AccountHelpPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "General",
    priority: "Medium",
  });

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await apiFetch<SupportTicket[]>("/api/helpsupport/tickets", {
        token,
      });
      setTickets(unwrap(r));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await unwrap(
        await apiFetch<SupportTicket>("/api/helpsupport/tickets", {
          method: "POST",
          token,
          body: JSON.stringify(form),
        }),
      );
      setForm({
        subject: "",
        description: "",
        category: "General",
        priority: "Medium",
      });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Destek talepleri
      </h1>
      {err && <p className="text-sm text-red-600">{err}</p>}

      <ul className="space-y-3">
        {tickets.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4"
          >
            <p className="font-medium">{t.subject}</p>
            <p className="text-sm text-[var(--ts-ink-muted)]">{t.status}</p>
            <p className="mt-2 text-sm">{t.description}</p>
          </li>
        ))}
      </ul>

      <form
        onSubmit={create}
        className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6"
      >
        <h2 className="font-semibold">Yeni talep</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Konu</Label>
            <Input
              required
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Açıklama</Label>
            <TextArea
              required
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kategori</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Öncelik</Label>
              <Input
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
        <Button type="submit" className="mt-4">
          Gönder
        </Button>
      </form>
    </div>
  );
}
