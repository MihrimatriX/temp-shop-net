"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { notifyCartChanged } from "@/context/toast-context";
import { apiFetch, unwrap, ApiCallError } from "@/lib/api";
import type { Cart } from "@/lib/types";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/components/price";

export default function CartPage() {
  const { token, loading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const r = await apiFetch<Cart>("/api/cart", { token });
      setCart(unwrap(r));
    } catch (e) {
      setErr(
        e instanceof ApiCallError || e instanceof Error
          ? e.message
          : "Sepet yüklenemedi",
      );
      setCart(null);
    }
  }, [token]);

  useEffect(() => {
    if (!loading && token) void load();
  }, [loading, token, load]);

  const updateQty = async (productId: number, quantity: number) => {
    if (!token || quantity < 1) return;
    setBusy(true);
    try {
      const r = await apiFetch<Cart>("/api/cart/update", {
        method: "PUT",
        token,
        body: JSON.stringify({ productId, quantity }),
      });
      setCart(unwrap(r));
      notifyCartChanged();
    } catch (e) {
      setErr(
        e instanceof ApiCallError || e instanceof Error
          ? e.message
          : "Güncellenemedi",
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (productId: number) => {
    if (!token) return;
    setBusy(true);
    try {
      await unwrap(
        await apiFetch(`/api/cart/remove/${productId}`, {
          method: "DELETE",
          token,
        }),
      );
      await load();
      notifyCartChanged();
    } catch (e) {
      setErr(
        e instanceof ApiCallError || e instanceof Error
          ? e.message
          : "Silinemedi",
      );
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await unwrap(
        await apiFetch("/api/cart/clear", { method: "DELETE", token }),
      );
      await load();
      notifyCartChanged();
    } catch (e) {
      setErr(
        e instanceof ApiCallError || e instanceof Error
          ? e.message
          : "Temizlenemedi",
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="p-10 text-center">Yükleniyor…</p>;
  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[var(--ts-ink-muted)]">
          Sepeti görmek için giriş yap.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-[var(--ts-coral)] underline"
        >
          Giriş
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Sepet
        </h1>
        {cart && cart.items.length > 0 && (
          <Button variant="ghost" size="sm" disabled={busy} onClick={clear}>
            Sepeti boşalt
          </Button>
        )}
      </div>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      {!cart || cart.items.length === 0 ? (
        <p className="mt-10 text-[var(--ts-ink-muted)]">Sepet boş.</p>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {cart.items.map((item) => (
              <li
                key={item.productId}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4 sm:flex-row"
              >
                <ProductImage
                  src={item.productImageUrl}
                  alt={item.productName}
                  className="h-24 w-24 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-medium text-[var(--ts-ink)] hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-sm text-[var(--ts-ink-muted)]">
                    Birim {formatMoney(item.unitPrice)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      defaultValue={item.quantity}
                      onBlur={(e) => {
                        const q = parseInt(e.target.value, 10);
                        if (q !== item.quantity)
                          void updateQty(item.productId, q);
                      }}
                    />
                    <span className="font-semibold">
                      {formatMoney(item.totalPrice)}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busy}
                      onClick={() => remove(item.productId)}
                    >
                      Kaldır
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex w-full flex-col items-end gap-2 border-t border-[var(--ts-border)] pt-6 text-sm">
            <div className="w-full max-w-xs space-y-1 text-[var(--ts-ink-muted)]">
              <div className="flex justify-between gap-4">
                <span>Ara toplam</span>
                <span>{formatMoney(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Kargo</span>
                <span>
                  {cart.shippingFee <= 0
                    ? "Ücretsiz"
                    : formatMoney(cart.shippingFee)}
                </span>
              </div>
              {cart.freeShippingRemainingTry != null &&
                cart.freeShippingRemainingTry > 0 && (
                  <p className="text-xs text-amber-800">
                    Ücretsiz kargo için{" "}
                    {formatMoney(cart.freeShippingRemainingTry)} daha ekleyin.
                  </p>
                )}
            </div>
            <p className="text-lg font-semibold text-[var(--ts-ink)]">
              Ödenecek: {formatMoney(cart.grandTotal)}
            </p>
            <Link href="/checkout">
              <Button size="lg">Ödemeye geç</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
