"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  Shield,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { Button } from "./ui/button";
import { MarketSearchBar } from "./market-search-bar";

const mobileLinks = [
  { href: "/products", label: "Ürünler" },
  { href: "/categories", label: "Kategoriler" },
  { href: "/campaigns", label: "Kampanyalar" },
  { href: "/help", label: "Yardım" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { token, user, logout, loading } = useAuth();
  const [cartCount, setCartCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const refreshCartCount = useCallback(() => {
    if (!token) {
      setCartCount(null);
      return;
    }
    void (async () => {
      try {
        const r = await apiFetch<number>("/api/cart/count", { token });
        if (r.json?.success && r.json.data !== undefined) {
          setCartCount(r.json.data);
        }
      } catch {
        setCartCount(null);
      }
    })();
  }, [token]);

  useEffect(() => {
    refreshCartCount();
  }, [token, pathname, refreshCartCount]);

  useEffect(() => {
    const onCart = () => refreshCartCount();
    window.addEventListener("temp-shop-cart-changed", onCart);
    return () => window.removeEventListener("temp-shop-cart-changed", onCart);
  }, [refreshCartCount]);

  return (
    <header className="border-b border-[var(--mp-border)] bg-[var(--mp-surface)]">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <Link href="/" className="group flex shrink-0 items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--mp-orange)] text-lg font-extrabold text-white shadow-sm">
                PK
              </span>
              <span className="text-xl font-extrabold tracking-tight text-[var(--mp-black)]">
                Pazar
                <span className="text-[var(--mp-orange)]">Kapısı</span>
              </span>
            </Link>

            <div className="flex items-center gap-1 lg:hidden">
              {user?.isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-md p-2 text-[var(--mp-success)]"
                  title="Yönetim"
                >
                  <Shield className="h-5 w-5" />
                </Link>
              )}
              <Link
                href="/cart"
                className="relative rounded-md p-2 text-[var(--mp-text)]"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount != null && cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--mp-orange)] px-1 text-[10px] font-bold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                className="rounded-md p-2"
                onClick={() => setOpen(!open)}
                aria-label="Menü"
              >
                {open ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <MarketSearchBar />
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <span
              className="mr-2 hidden items-center gap-1 text-xs text-[var(--mp-text-muted)] xl:flex"
              title="Teslimat adresi (demo)"
            >
              <MapPin className="h-3.5 w-3.5 text-[var(--mp-orange)]" />
              Teslimat:{" "}
              <strong className="text-[var(--mp-text)]">İstanbul</strong>
            </span>
            {user?.isAdmin && (
              <Link
                href="/admin"
                className="rounded-md p-2 text-[var(--mp-success)] hover:bg-[var(--mp-bg)]"
                title="Yönetim"
              >
                <Shield className="h-5 w-5" />
              </Link>
            )}
            {token && (
              <Link
                href="/account/favorites"
                className="rounded-md p-2 text-[var(--mp-text-muted)] hover:bg-[var(--mp-bg)]"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}
            <Link
              href="/cart"
              className="relative rounded-md p-2 text-[var(--mp-text)] hover:bg-[var(--mp-bg)]"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount != null && cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--mp-orange)] px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            {!loading &&
              (token ? (
                <div className="ml-1 flex items-center gap-1">
                  <Link href="/account">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5 border-[var(--mp-border)]"
                    >
                      <User className="h-4 w-4" />
                      Hesabım
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => logout()}>
                    Çıkış
                  </Button>
                </div>
              ) : (
                <div className="ml-1 flex items-center gap-1">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Giriş
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="!bg-[var(--mp-orange)] !text-white hover:!bg-[var(--mp-orange-hover)]"
                    >
                      Kayıt ol
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--mp-border)] bg-[var(--mp-surface)] px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {mobileLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--mp-text)] hover:bg-[var(--mp-bg)]"
              >
                {item.label}
              </Link>
            ))}
            {user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--mp-success)]"
              >
                Yönetim
              </Link>
            )}
            {token ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm"
                >
                  Hesabım
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm"
                >
                  Giriş
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-[var(--mp-orange)]"
                >
                  Kayıt ol
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
