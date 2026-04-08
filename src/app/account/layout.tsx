"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const links = [
  { href: "/account/orders", label: "Siparişler" },
  { href: "/account/addresses", label: "Adresler" },
  { href: "/account/payment", label: "Ödeme" },
  { href: "/account/favorites", label: "Favoriler" },
  { href: "/account/notifications", label: "Bildirimler" },
  { href: "/account/settings", label: "Ayarlar" },
  { href: "/account/security", label: "Güvenlik" },
  { href: "/account/help", label: "Destek talepleri" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { token, loading, user } = useAuth();

  if (loading) {
    return <p className="p-10 text-center">Yükleniyor…</p>;
  }
  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[var(--ts-ink-muted)]">
          Bu alan için giriş gerekli.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-[var(--ts-coral)] underline"
        >
          Giriş yap
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:px-6">
      <aside className="shrink-0 md:w-56">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ts-ink-faint)]">
          Hesap
        </p>
        {user?.email && (
          <p className="mt-1 truncate text-sm text-[var(--ts-ink-muted)]">
            {user.email}
          </p>
        )}
        <nav className="mt-6 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === l.href
                  ? "bg-[var(--ts-surface)] text-[var(--ts-ink)] shadow-sm"
                  : "text-[var(--ts-ink-muted)] hover:bg-[var(--ts-surface)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-2 text-sm font-medium text-[var(--ts-mint)] ${
                pathname?.startsWith("/admin") ? "bg-teal-50" : ""
              }`}
            >
              Yönetim
            </Link>
          )}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
