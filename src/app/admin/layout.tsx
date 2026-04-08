"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Megaphone,
  Bell,
  Store,
  UserCircle,
  BookOpen,
  Headphones,
  Star,
  Activity,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

const nav = [
  { href: "/admin", label: "Özet", icon: LayoutDashboard },
  { href: "/admin/catalog", label: "Katalog", icon: Package },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/campaigns", label: "Kampanyalar", icon: Megaphone },
  { href: "/admin/notifications", label: "Bildirimler", icon: Bell },
  { href: "/admin/help", label: "Yardım", icon: BookOpen },
  { href: "/admin/support", label: "Destek", icon: Headphones },
  { href: "/admin/reviews", label: "Yorumlar", icon: Star },
  { href: "/admin/system", label: "Sistem", icon: Activity },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-[var(--ts-ink-muted)]">
        Yükleniyor…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[var(--ts-ink-muted)]">
          Yönetim paneli için giriş yapmanız gerekir.
        </p>
        <Link
          href={`/login?returnUrl=${encodeURIComponent(pathname || "/admin")}`}
          className="mt-4 inline-block font-medium text-[var(--ts-coral)] underline"
        >
          Giriş yap
        </Link>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[var(--ts-ink-muted)]">
          Bu alan yalnızca yöneticiler içindir. Hesabınızda{" "}
          <code className="rounded bg-[var(--ts-sand)] px-1">Admin</code> rolü
          ve{" "}
          <code className="rounded bg-[var(--ts-sand)] px-1">
            Auth:AdminEmails
          </code>{" "}
          yapılandırması gerekir.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-[var(--ts-coral)] underline"
        >
          Mağazaya dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-[var(--mp-bg)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:px-6">
        <aside className="shrink-0 md:w-56">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ts-ink-faint)]">
            Yönetim
          </p>
          {user.email && (
            <p className="mt-1 truncate text-sm text-[var(--ts-ink-muted)]">
              {user.email}
            </p>
          )}
          <nav className="mt-6 flex flex-col gap-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--mp-surface)] text-[var(--mp-text)] shadow-sm ring-1 ring-[var(--mp-border)]"
                      : "text-[var(--mp-text-muted)] hover:bg-[var(--mp-surface)]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  {label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--mp-orange)] hover:bg-[var(--mp-orange-soft)]"
            >
              <Store className="h-4 w-4 shrink-0" aria-hidden />
              Mağazaya dön
            </Link>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--mp-text-muted)] hover:bg-[var(--mp-surface)]"
            >
              <UserCircle className="h-4 w-4 shrink-0" aria-hidden />
              Hesabım
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
