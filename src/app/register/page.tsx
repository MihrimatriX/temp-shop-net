"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    city: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber || undefined,
        city: form.city || undefined,
      });
      router.push("/account");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Kayıt başarısız");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ts-ink)]">
        Kayıt ol
      </h1>
      <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="text-[var(--ts-coral)] underline">
          Giriş
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="fn">Ad</Label>
            <Input
              id="fn"
              required
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="ln">Soyad</Label>
            <Input
              id="ln"
              required
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="password">Şifre (min 6)</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefon (isteğe bağlı)</Label>
          <Input
            id="phone"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, phoneNumber: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="city">Şehir (isteğe bağlı)</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          Kayıt ol
        </Button>
      </form>
    </div>
  );
}
