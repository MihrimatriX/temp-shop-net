"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { API_BASE } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type JsonBox = { label: string; data: unknown };

export default function AdminSystemPage() {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState<JsonBox[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [reg, setReg] = useState({
    email: "",
    password: "Test123!",
    firstName: "Test",
    lastName: "Kullanıcı",
  });

  const fetchJson = useCallback(async (label: string, path: string) => {
    setBusy(label);
    try {
      const res = await fetch(`${API_BASE}${path}`);
      const text = await res.text();
      let data: unknown = text;
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        /* metin yanıt */
      }
      setBoxes((b) => [{ label: `${label} (${res.status})`, data }, ...b]);
    } catch (e) {
      setBoxes((b) => [
        {
          label: `${label} (hata)`,
          data: e instanceof Error ? e.message : "?",
        },
        ...b,
      ]);
    } finally {
      setBusy(null);
    }
  }, []);

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("register");
    try {
      const r = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: reg.email,
          password: reg.password,
          firstName: reg.firstName,
          lastName: reg.lastName,
        }),
      });
      setBoxes((b) => [
        { label: "POST /api/auth/register", data: r.json ?? r },
        ...b,
      ]);
    } catch (e) {
      setBoxes((b) => [
        {
          label: "POST /api/auth/register (hata)",
          data: e instanceof Error ? e.message : "?",
        },
        ...b,
      ]);
    } finally {
      setBusy(null);
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Sistem &amp; API araçları
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          Kimlik gerektirmeyen uçlar doğrudan{" "}
          <code className="rounded bg-[var(--ts-sand)] px-1">{API_BASE}</code>{" "}
          üzerinden çağrılır.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!!busy}
          onClick={() => fetchJson("GET /api/health", "/api/health")}
        >
          Health
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!!busy}
          onClick={() => fetchJson("GET /api/test/ping", "/api/test/ping")}
        >
          Test ping
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!!busy}
          onClick={() => fetchJson("GET /api/test/info", "/api/test/info")}
        >
          Test info
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!!busy}
          onClick={() =>
            fetchJson("GET /api/metrics/custom", "/api/metrics/custom")
          }
        >
          Metrics (custom)
        </Button>
      </div>
      {busy && (
        <p className="text-sm text-[var(--mp-text-muted)]">İstek: {busy}…</p>
      )}

      <section className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Kayıt (test)</h2>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          <code className="rounded bg-[var(--ts-sand)] px-1">
            POST /api/auth/register
          </code>
        </p>
        <form
          onSubmit={registerUser}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label>E-posta (benzersiz)</Label>
            <Input
              type="email"
              required
              value={reg.email}
              onChange={(e) => setReg((r) => ({ ...r, email: e.target.value }))}
              placeholder="yeni.kullanici@example.com"
            />
          </div>
          <div>
            <Label>Şifre</Label>
            <Input
              type="password"
              value={reg.password}
              onChange={(e) =>
                setReg((r) => ({ ...r, password: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Ad / Soyad</Label>
            <div className="flex gap-2">
              <Input
                value={reg.firstName}
                onChange={(e) =>
                  setReg((r) => ({ ...r, firstName: e.target.value }))
                }
              />
              <Input
                value={reg.lastName}
                onChange={(e) =>
                  setReg((r) => ({ ...r, lastName: e.target.value }))
                }
              />
            </div>
          </div>
          <Button type="submit" size="sm" className="sm:col-span-2">
            Kayıt dene
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Yanıtlar</h2>
        <div className="mt-3 space-y-3">
          {boxes.map((b, i) => (
            <pre
              key={`${b.label}-${i}`}
              className="max-h-64 overflow-auto rounded-xl border border-[var(--mp-border)] bg-[var(--mp-bg)] p-3 text-xs"
            >
              {b.label}
              {"\n"}
              {JSON.stringify(b.data, null, 2)}
            </pre>
          ))}
        </div>
      </section>
    </div>
  );
}
