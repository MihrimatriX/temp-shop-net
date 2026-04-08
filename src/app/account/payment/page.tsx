"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function PaymentPage() {
  const { token, user } = useAuth();
  const [list, setList] = useState<PaymentMethod[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    type: "Card",
    cardHolderName: "",
    cardNumber: "",
    expiryMonth: 12,
    expiryYear: 2028,
    cvv: "",
    isDefault: true,
  });

  const load = useCallback(async () => {
    if (!token || !user) return;
    try {
      const r = await apiFetch<PaymentMethod[]>(
        `/api/paymentmethod/user/${user.userId}`,
        { token },
      );
      setList(unwrap(r));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  }, [token, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await unwrap(
        await apiFetch<PaymentMethod>("/api/paymentmethod", {
          method: "POST",
          token,
          body: JSON.stringify(form),
        }),
      );
      setForm({
        type: "Card",
        cardHolderName: "",
        cardNumber: "",
        expiryMonth: 12,
        expiryYear: 2028,
        cvv: "",
        isDefault: true,
      });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  const setDefault = async (id: number) => {
    if (!token) return;
    setBusy(true);
    try {
      await unwrap(
        await apiFetch<PaymentMethod>(`/api/paymentmethod/${id}/default`, {
          method: "PUT",
          token,
        }),
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: number) => {
    if (!token) return;
    setBusy(true);
    try {
      await unwrap(
        await apiFetch(`/api/paymentmethod/${id}`, {
          method: "DELETE",
          token,
        }),
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Ödeme yöntemleri
      </h1>
      <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
        Kart bilgileri API tarafında maskelenir; demo için test verisi kullan.
      </p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <ul className="mt-6 space-y-3">
        {list.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4"
          >
            <p className="font-medium">{p.type}</p>
            <p className="text-sm text-[var(--ts-ink-muted)]">
              {p.cardHolderName} · {p.cardNumber}
            </p>
            {p.isDefault && (
              <span className="mt-2 inline-block text-xs font-semibold text-[var(--ts-mint)]">
                Varsayılan
              </span>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {!p.isDefault && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => setDefault(p.id)}
                >
                  Varsayılan
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => del(p.id)}
              >
                Sil
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold">Yeni kart</h2>
      <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Tür</Label>
          <Input
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          />
        </div>
        <div>
          <Label>Kart üzerindeki isim</Label>
          <Input
            required
            value={form.cardHolderName}
            onChange={(e) =>
              setForm((f) => ({ ...f, cardHolderName: e.target.value }))
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Kart numarası</Label>
          <Input
            required
            value={form.cardNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, cardNumber: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Ay</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={form.expiryMonth}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                expiryMonth: parseInt(e.target.value, 10) || 1,
              }))
            }
          />
        </div>
        <div>
          <Label>Yıl</Label>
          <Input
            type="number"
            min={2024}
            max={2050}
            value={form.expiryYear}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                expiryYear: parseInt(e.target.value, 10) || 2028,
              }))
            }
          />
        </div>
        <div>
          <Label>CVV</Label>
          <Input
            value={form.cvv}
            onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value }))}
          />
        </div>
        <Button type="submit" disabled={busy} className="sm:col-span-2">
          Kaydet
        </Button>
      </form>
    </div>
  );
}
