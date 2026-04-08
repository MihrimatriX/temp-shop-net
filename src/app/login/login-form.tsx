"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function safeReturnUrl(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  return raw;
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = safeReturnUrl(searchParams.get("returnUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login(email, password);
      router.push(returnUrl ?? "/account");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Giriş başarısız");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ts-ink)]">
        Giriş
      </h1>
      <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
        Hesabın yok mu?{" "}
        <Link href="/register" className="text-[var(--ts-coral)] underline">
          Kayıt ol
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          Giriş yap
        </Button>
      </form>
    </div>
  );
}
