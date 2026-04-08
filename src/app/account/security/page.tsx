"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { LoginHistory, SecurityInfo, SecuritySettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function SecurityPage() {
  const { token } = useAuth();
  const [info, setInfo] = useState<SecurityInfo | null>(null);
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [secSet, setSecSet] = useState<SecuritySettings | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailF, setEmailF] = useState({
    newEmail: "",
    currentPassword: "",
  });

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const [i, h, s] = await Promise.all([
        apiFetch<SecurityInfo>("/api/security/info", { token }),
        apiFetch<LoginHistory[]>("/api/security/login-history", { token }),
        apiFetch<SecuritySettings>("/api/security/settings", { token }),
      ]);
      setInfo(unwrap(i));
      setHistory(unwrap(h));
      setSecSet(unwrap(s));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await unwrap(
        await apiFetch("/api/security/change-password", {
          method: "POST",
          token,
          body: JSON.stringify(pw),
        }),
      );
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await unwrap(
        await apiFetch("/api/security/update-email", {
          method: "POST",
          token,
          body: JSON.stringify(emailF),
        }),
      );
      setEmailF({ newEmail: "", currentPassword: "" });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const saveSec = async () => {
    if (!token || !secSet) return;
    try {
      await unwrap(
        await apiFetch<SecuritySettings>("/api/security/settings", {
          method: "PUT",
          token,
          body: JSON.stringify(secSet),
        }),
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const logoutAll = async () => {
    if (!token) return;
    try {
      await unwrap(
        await apiFetch("/api/security/logout-all-devices", {
          method: "POST",
          token,
        }),
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Güvenlik
      </h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {info && (
        <section className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6 text-sm">
          <p>
            <strong>E-posta:</strong> {info.email}
          </p>
          <p className="mt-2">
            2FA: {info.twoFactorEnabled ? "Açık" : "Kapalı"}
          </p>
        </section>
      )}

      <form
        onSubmit={changePw}
        className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6"
      >
        <h2 className="font-semibold">Şifre değiştir</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Mevcut şifre</Label>
            <Input
              type="password"
              required
              value={pw.currentPassword}
              onChange={(e) =>
                setPw((p) => ({ ...p, currentPassword: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Yeni şifre</Label>
            <Input
              type="password"
              required
              value={pw.newPassword}
              onChange={(e) =>
                setPw((p) => ({ ...p, newPassword: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Yeni şifre tekrar</Label>
            <Input
              type="password"
              required
              value={pw.confirmPassword}
              onChange={(e) =>
                setPw((p) => ({ ...p, confirmPassword: e.target.value }))
              }
            />
          </div>
        </div>
        <Button type="submit" className="mt-4">
          Güncelle
        </Button>
      </form>

      <form
        onSubmit={changeEmail}
        className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6"
      >
        <h2 className="font-semibold">E-posta güncelle</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Yeni e-posta</Label>
            <Input
              type="email"
              required
              value={emailF.newEmail}
              onChange={(e) =>
                setEmailF((f) => ({ ...f, newEmail: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Mevcut şifre</Label>
            <Input
              type="password"
              required
              value={emailF.currentPassword}
              onChange={(e) =>
                setEmailF((f) => ({ ...f, currentPassword: e.target.value }))
              }
            />
          </div>
        </div>
        <Button type="submit" className="mt-4" variant="secondary">
          E-postayı güncelle
        </Button>
      </form>

      {secSet && (
        <section className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6">
          <h2 className="font-semibold">Güvenlik tercihleri</h2>
          <div className="mt-4 space-y-2 text-sm">
            {(
              [
                ["loginAlerts", "Giriş uyarıları"],
                ["emailNotifications", "E-posta"],
                ["smsNotifications", "SMS"],
                ["twoFactorRequired", "2FA zorunlu"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={secSet[key] as boolean}
                  onChange={(e) =>
                    setSecSet({ ...secSet, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <Label>Oturum süresi (dk)</Label>
            <Input
              type="number"
              value={secSet.sessionTimeout}
              onChange={(e) =>
                setSecSet({
                  ...secSet,
                  sessionTimeout: parseInt(e.target.value, 10) || 30,
                })
              }
            />
          </div>
          <Button className="mt-4" onClick={saveSec}>
            Kaydet
          </Button>
        </section>
      )}

      <section className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6">
        <h2 className="font-semibold">Giriş geçmişi</h2>
        <ul className="mt-4 space-y-2 text-sm text-[var(--ts-ink-muted)]">
          {history.map((h) => (
            <li key={h.id}>
              {new Date(h.loginAt).toLocaleString("tr-TR")} —{" "}
              {h.ipAddress ?? "?"} — {h.isSuccessful ? "OK" : "Hata"}
            </li>
          ))}
        </ul>
      </section>

      <Button variant="danger" onClick={logoutAll}>
        Tüm cihazlardan çık (API)
      </Button>
    </div>
  );
}
