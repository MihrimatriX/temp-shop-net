"use client";

import { useState } from "react";
import { apiFetch, unwrap } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/input";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "General",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    try {
      await unwrap(
        await apiFetch<string>("/api/helpsupport/contact", {
          method: "POST",
          body: JSON.stringify(form),
        }),
      );
      setMsg("Gönderildi. Teşekkürler!");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        category: "General",
      });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Hata");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6"
    >
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
        Bize yazın
      </h2>
      <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
        <code className="rounded bg-[var(--ts-sand)] px-1">
          POST /api/helpsupport/contact
        </code>
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Ad</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <Label>E-posta</Label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <Label>Telefon</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
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
        <div className="sm:col-span-2">
          <Label>Mesaj</Label>
          <TextArea
            required
            rows={4}
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
          />
        </div>
      </div>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      {msg && <p className="mt-4 text-sm text-[var(--ts-mint)]">{msg}</p>}
      <Button type="submit" className="mt-4">
        Gönder
      </Button>
    </form>
  );
}
