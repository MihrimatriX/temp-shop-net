"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Campaign } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/input";

function isoToLocal(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

type CampForm = {
  title: string;
  subtitle: string;
  description: string;
  discount: number;
  imageUrl: string;
  backgroundColor: string;
  timeLeft: string;
  buttonText: string;
  buttonHref: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const emptyForm = (): CampForm => ({
  title: "Temp Shop kampanya",
  subtitle: "",
  description: "",
  discount: 10,
  imageUrl: "",
  backgroundColor: "#fde68a",
  timeLeft: "",
  buttonText: "Ürünlere git",
  buttonHref: "/products",
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16),
  isActive: true,
});

const formFromCampaign = (c: Campaign): CampForm => ({
  title: c.title,
  subtitle: c.subtitle ?? "",
  description: c.description ?? "",
  discount: c.discount,
  imageUrl: c.imageUrl ?? "",
  backgroundColor: c.backgroundColor ?? "#fde68a",
  timeLeft: c.timeLeft ?? "",
  buttonText: c.buttonText ?? "",
  buttonHref: c.buttonHref ?? "/products",
  startDate: isoToLocal(c.startDate),
  endDate: isoToLocal(c.endDate),
  isActive: c.isActive,
});

export default function AdminCampaignsPage() {
  const { token, user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [campForm, setCampForm] = useState<CampForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    setErr(null);
    try {
      const c = await apiFetch<Campaign[]>("/api/campaign", { token });
      setCampaigns(unwrap(c));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Yüklenemedi");
    }
  }, [token, user?.isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const body = {
        ...campForm,
        startDate: new Date(campForm.startDate).toISOString(),
        endDate: new Date(campForm.endDate).toISOString(),
      };
      if (editId != null) {
        await unwrap(
          await apiFetch<Campaign>(`/api/campaign/${editId}`, {
            method: "PUT",
            token,
            body: JSON.stringify(body),
          }),
        );
        setEditId(null);
      } else {
        await unwrap(
          await apiFetch<Campaign>("/api/campaign", {
            method: "POST",
            token,
            body: JSON.stringify(body),
          }),
        );
      }
      setCampForm(emptyForm());
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const deleteCampaign = async (id: number) => {
    if (!token) return;
    try {
      await unwrap(
        await apiFetch(`/api/campaign/${id}`, { method: "DELETE", token }),
      );
      if (editId === id) {
        setEditId(null);
        setCampForm(emptyForm());
      }
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const startEdit = (c: Campaign) => {
    setEditId(c.id);
    setCampForm(formFromCampaign(c));
  };

  const cancelEdit = () => {
    setEditId(null);
    setCampForm(emptyForm());
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Kampanyalar
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          <code className="rounded bg-[var(--ts-sand)] px-1">
            GET/POST/PUT/DELETE /api/campaign
          </code>
        </p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}

      <ul className="space-y-2">
        {campaigns.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--mp-border)] bg-[var(--mp-surface)] px-4 py-3 text-sm shadow-sm"
          >
            <span className="font-medium">{c.title}</span>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => startEdit(c)}
              >
                Düzenle
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => deleteCampaign(c.id)}
              >
                Pasifleştir
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <form
        onSubmit={submitCampaign}
        className="grid gap-3 rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm sm:grid-cols-2"
      >
        <div className="sm:col-span-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editId != null ? `Kampanya düzenle #${editId}` : "Yeni kampanya"}
          </h2>
          {editId != null && (
            <button
              type="button"
              className="text-sm text-[var(--mp-text-muted)] underline"
              onClick={cancelEdit}
            >
              İptal
            </button>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label>Başlık</Label>
          <Input
            value={campForm.title}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, title: e.target.value }))
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Alt başlık</Label>
          <Input
            value={campForm.subtitle}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, subtitle: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>İndirim %</Label>
          <Input
            type="number"
            value={campForm.discount}
            onChange={(e) =>
              setCampForm((f) => ({
                ...f,
                discount: parseInt(e.target.value, 10) || 0,
              }))
            }
          />
        </div>
        <div>
          <Label>Arka plan rengi</Label>
          <Input
            value={campForm.backgroundColor}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, backgroundColor: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Görsel URL</Label>
          <Input
            value={campForm.imageUrl}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, imageUrl: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Zaman metni</Label>
          <Input
            value={campForm.timeLeft}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, timeLeft: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Buton metni</Label>
          <Input
            value={campForm.buttonText}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, buttonText: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Buton link</Label>
          <Input
            value={campForm.buttonHref}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, buttonHref: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Başlangıç (yerel)</Label>
          <Input
            type="datetime-local"
            value={campForm.startDate}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, startDate: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Bitiş (yerel)</Label>
          <Input
            type="datetime-local"
            value={campForm.endDate}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, endDate: e.target.value }))
            }
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            id="camp-active"
            type="checkbox"
            checked={campForm.isActive}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />
          <label htmlFor="camp-active" className="text-sm">
            Aktif
          </label>
        </div>
        <div className="sm:col-span-2">
          <Label>Açıklama</Label>
          <TextArea
            rows={2}
            value={campForm.description}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
        <Button type="submit" className="sm:col-span-2">
          {editId != null ? "Kampanyayı kaydet" : "Kampanya oluştur"}
        </Button>
      </form>
    </div>
  );
}
