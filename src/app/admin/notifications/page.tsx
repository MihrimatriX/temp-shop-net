"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/input";

export default function AdminNotificationsPage() {
  const { token, user } = useAuth();
  const [targetUserId, setTargetUserId] = useState("");
  const [notif, setNotif] = useState({
    title: "",
    message: "",
    type: "Info",
    actionUrl: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [listUserId, setListUserId] = useState("");
  const [userNotifs, setUserNotifs] = useState<Notification[]>([]);

  const sendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    setOk(null);
    const uid = parseInt(targetUserId, 10);
    if (!Number.isFinite(uid)) {
      setErr("Geçerli kullanıcı ID girin");
      return;
    }
    try {
      await unwrap(
        await apiFetch("/api/notification", {
          method: "POST",
          token,
          body: JSON.stringify({
            userId: uid,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            actionUrl: notif.actionUrl || undefined,
          }),
        }),
      );
      setNotif({ title: "", message: "", type: "Info", actionUrl: "" });
      setOk("Bildirim gönderildi.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const loadUserNotifs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    const uid = parseInt(listUserId, 10);
    if (!Number.isFinite(uid)) {
      setErr("Listelemek için geçerli kullanıcı ID girin");
      return;
    }
    try {
      const r = await apiFetch<Notification[]>(
        `/api/notification/admin/user/${uid}?pageSize=50`,
        { token },
      );
      setUserNotifs(unwrap(r));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Liste alınamadı");
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Bildirimler
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          <code className="rounded bg-[var(--ts-sand)] px-1">
            POST /api/notification
          </code>
          ,{" "}
          <code className="rounded bg-[var(--ts-sand)] px-1">
            GET /api/notification/admin/user/{"{id}"}
          </code>
        </p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-[var(--mp-success)]">{ok}</p>}

      <form
        onSubmit={sendNotif}
        className="max-w-lg space-y-4 rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm"
      >
        <h2 className="font-semibold">Yeni bildirim (admin)</h2>
        <div>
          <Label>Kullanıcı ID</Label>
          <Input
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="ör. 2"
          />
        </div>
        <div>
          <Label>Başlık</Label>
          <Input
            value={notif.title}
            onChange={(e) => setNotif((n) => ({ ...n, title: e.target.value }))}
          />
        </div>
        <div>
          <Label>Mesaj</Label>
          <TextArea
            rows={3}
            value={notif.message}
            onChange={(e) =>
              setNotif((n) => ({ ...n, message: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Tip</Label>
          <select
            className="mt-1 w-full rounded-xl border border-[var(--mp-border)] px-3 py-2 text-sm"
            value={notif.type}
            onChange={(e) => setNotif((n) => ({ ...n, type: e.target.value }))}
          >
            <option value="Info">Info</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
          </select>
        </div>
        <div>
          <Label>İşlem URL (isteğe bağlı)</Label>
          <Input
            value={notif.actionUrl}
            onChange={(e) =>
              setNotif((n) => ({ ...n, actionUrl: e.target.value }))
            }
            placeholder="/account/orders"
          />
        </div>
        <Button type="submit">Gönder</Button>
      </form>

      <section className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm">
        <h2 className="font-semibold">Kullanıcının bildirimleri</h2>
        <form
          onSubmit={loadUserNotifs}
          className="mt-4 flex flex-wrap items-end gap-2"
        >
          <div>
            <Label>Kullanıcı ID</Label>
            <Input
              className="w-36"
              value={listUserId}
              onChange={(e) => setListUserId(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Listele
          </Button>
        </form>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
          {userNotifs.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-[var(--mp-border)] px-3 py-2"
            >
              <span className="font-medium">{n.title}</span> — {n.type}
              {n.isRead ? (
                <span className="text-[var(--mp-text-faint)]"> okundu</span>
              ) : (
                <span className="text-[var(--mp-orange)]"> yeni</span>
              )}
              <p className="text-[var(--mp-text-muted)]">{n.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
