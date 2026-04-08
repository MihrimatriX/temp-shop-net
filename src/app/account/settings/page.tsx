"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { PrivacySettings, UserSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";

export default function SettingsPage() {
  const { token } = useAuth();
  const [userS, setUserS] = useState<UserSettings | null>(null);
  const [privS, setPrivS] = useState<PrivacySettings | null>(null);
  const [importJson, setImportJson] = useState("");
  const [exportText, setExportText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const [u, p] = await Promise.all([
        apiFetch<UserSettings>("/api/settings/user", { token }),
        apiFetch<PrivacySettings>("/api/settings/privacy", { token }),
      ]);
      setUserS(unwrap(u));
      setPrivS(unwrap(p));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveUser = async () => {
    if (!token || !userS) return;
    setMsg(null);
    try {
      await unwrap(
        await apiFetch<UserSettings>("/api/settings/user", {
          method: "PUT",
          token,
          body: JSON.stringify({
            language: userS.language,
            timezone: userS.timezone,
            currency: userS.currency,
            theme: userS.theme,
            emailNotifications: userS.emailNotifications,
            pushNotifications: userS.pushNotifications,
            orderUpdates: userS.orderUpdates,
          }),
        }),
      );
      setMsg("Kaydedildi.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const savePriv = async () => {
    if (!token || !privS) return;
    setMsg(null);
    try {
      await unwrap(
        await apiFetch<PrivacySettings>("/api/settings/privacy", {
          method: "PUT",
          token,
          body: JSON.stringify({
            profileVisibility: privS.profileVisibility,
            allowAnalytics: privS.allowAnalytics,
            allowCookies: privS.allowCookies,
            allowMarketing: privS.allowMarketing,
          }),
        }),
      );
      setMsg("Gizlilik güncellendi.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const doExport = async () => {
    if (!token) return;
    try {
      const r = await apiFetch<string>("/api/settings/export", { token });
      setExportText(unwrap(r));
      setMsg("Dışa aktarıldı (aşağıda).");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const doImport = async () => {
    if (!token || !importJson.trim()) return;
    try {
      await unwrap(
        await apiFetch<string>("/api/settings/import", {
          method: "POST",
          token,
          body: JSON.stringify(importJson),
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }),
      );
      setMsg("İçe aktarıldı.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const reset = async () => {
    if (!token) return;
    try {
      await unwrap(
        await apiFetch("/api/settings/reset", { method: "POST", token }),
      );
      setMsg("Varsayılanlara döndü.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  if (!userS || !privS) {
    return err ? <p className="text-red-600">{err}</p> : <p>Yükleniyor…</p>;
  }

  return (
    <div className="space-y-10">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Ayarlar
      </h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm text-[var(--ts-mint)]">{msg}</p>}

      <section className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6">
        <h2 className="font-semibold">Genel</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Dil</Label>
            <Select
              value={userS.language}
              onChange={(e) => setUserS({ ...userS, language: e.target.value })}
            >
              <option value="tr">tr</option>
              <option value="en">en</option>
            </Select>
          </div>
          <div>
            <Label>Para birimi</Label>
            <Select
              value={userS.currency}
              onChange={(e) => setUserS({ ...userS, currency: e.target.value })}
            >
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
          </div>
          <div>
            <Label>Tema</Label>
            <Select
              value={userS.theme}
              onChange={(e) => setUserS({ ...userS, theme: e.target.value })}
            >
              <option value="light">light</option>
              <option value="dark">dark</option>
            </Select>
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={userS.emailNotifications}
            onChange={(e) =>
              setUserS({ ...userS, emailNotifications: e.target.checked })
            }
          />
          E-posta bildirimleri
        </label>
        <Button className="mt-4" onClick={saveUser}>
          Kaydet
        </Button>
      </section>

      <section className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6">
        <h2 className="font-semibold">Gizlilik</h2>
        <div className="mt-4 space-y-2 text-sm">
          {(
            [
              ["profileVisibility", "Profil görünür"],
              ["allowAnalytics", "Analitik"],
              ["allowCookies", "Çerezler"],
              ["allowMarketing", "Pazarlama"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={privS[key] as boolean}
                onChange={(e) =>
                  setPrivS({ ...privS, [key]: e.target.checked })
                }
              />
              {label}
            </label>
          ))}
        </div>
        <Button className="mt-4" variant="secondary" onClick={savePriv}>
          Gizliliği kaydet
        </Button>
      </section>

      <section className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6">
        <h2 className="font-semibold">Dışa / içe aktar</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={doExport}>
            Dışa aktar
          </Button>
          <Button variant="ghost" onClick={reset}>
            Varsayılanlar
          </Button>
        </div>
        {exportText && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-[var(--ts-sand)] p-3 text-xs">
            {exportText}
          </pre>
        )}
        <textarea
          className="mt-4 w-full rounded-xl border border-[var(--ts-border)] p-3 text-sm"
          rows={4}
          placeholder="İçe aktarılacak JSON (export çıktısı)"
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
        />
        <Button className="mt-2" variant="secondary" onClick={doImport}>
          İçe aktar
        </Button>
      </section>
    </div>
  );
}
