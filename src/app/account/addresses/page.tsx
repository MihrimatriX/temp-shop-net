"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Address } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AddressesPage() {
  const { token, user } = useAuth();
  const [list, setList] = useState<Address[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    fullAddress: "",
    city: "",
    district: "",
    postalCode: "",
    country: "Turkey",
    phoneNumber: "",
    isDefault: false,
  });

  const load = useCallback(async () => {
    if (!token || !user) return;
    try {
      const r = await apiFetch<Address[]>(`/api/address/user/${user.userId}`, {
        token,
      });
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
        await apiFetch<Address>("/api/address", {
          method: "POST",
          token,
          body: JSON.stringify(form),
        }),
      );
      setForm({
        title: "",
        fullAddress: "",
        city: "",
        district: "",
        postalCode: "",
        country: "Turkey",
        phoneNumber: "",
        isDefault: false,
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
        await apiFetch<Address>(`/api/address/${id}/default`, {
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
        await apiFetch(`/api/address/${id}`, { method: "DELETE", token }),
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
        Adresler
      </h1>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <ul className="mt-6 space-y-3">
        {list.map((a) => (
          <li
            key={a.id}
            className="rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4"
          >
            <p className="font-medium">{a.title}</p>
            <p className="text-sm text-[var(--ts-ink-muted)]">
              {a.fullAddress}, {a.district} / {a.city} {a.postalCode}
            </p>
            {a.isDefault && (
              <span className="mt-2 inline-block text-xs font-semibold text-[var(--ts-mint)]">
                Varsayılan
              </span>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {!a.isDefault && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => setDefault(a.id)}
                >
                  Varsayılan yap
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => del(a.id)}
              >
                Sil
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold">Yeni adres</h2>
      <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Başlık</Label>
          <Input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Adres</Label>
          <Input
            required
            value={form.fullAddress}
            onChange={(e) =>
              setForm((f) => ({ ...f, fullAddress: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>İlçe</Label>
          <Input
            required
            value={form.district}
            onChange={(e) =>
              setForm((f) => ({ ...f, district: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Şehir</Label>
          <Input
            required
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        <div>
          <Label>Posta kodu</Label>
          <Input
            required
            value={form.postalCode}
            onChange={(e) =>
              setForm((f) => ({ ...f, postalCode: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Ülke</Label>
          <Input
            value={form.country}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Telefon</Label>
          <Input
            value={form.phoneNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, phoneNumber: e.target.value }))
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) =>
              setForm((f) => ({ ...f, isDefault: e.target.checked }))
            }
          />
          Varsayılan adres
        </label>
        <Button type="submit" disabled={busy} className="sm:col-span-2">
          Kaydet
        </Button>
      </form>
    </div>
  );
}
