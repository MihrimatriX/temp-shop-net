"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { notifyCartChanged, useToast } from "@/context/toast-context";
import { apiFetch, unwrap, ApiCallError } from "@/lib/api";
import type { Address, Cart, Order, PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label, TextArea } from "@/components/ui/input";
import { formatMoney } from "@/components/price";

export default function CheckoutPage() {
  const { token, user, loading } = useAuth();
  const { show: toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [shipId, setShipId] = useState<number | "">("");
  const [payId, setPayId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const load = useCallback(async () => {
    if (!token || !user) return;
    setErr(null);
    try {
      const [c, a, p] = await Promise.all([
        apiFetch<Cart>("/api/cart", { token }),
        apiFetch<Address[]>(`/api/address/user/${user.userId}`, { token }),
        apiFetch<PaymentMethod[]>(`/api/paymentmethod/user/${user.userId}`, {
          token,
        }),
      ]);
      const cartData = unwrap(c);
      const addr = unwrap(a);
      const pm = unwrap(p);
      setCart(cartData);
      setAddresses(addr);
      setPayments(pm);
      const defA = addr.find((x) => x.isDefault);
      const defP = pm.find((x) => x.isDefault);
      setShipId(defA?.id ?? addr[0]?.id ?? "");
      setPayId(defP?.id ?? pm[0]?.id ?? "");
    } catch (e) {
      setErr(
        e instanceof ApiCallError || e instanceof Error
          ? e.message
          : "Yüklenemedi",
      );
    }
  }, [token, user]);

  useEffect(() => {
    if (!loading && token && user) void load();
  }, [loading, token, user, load]);

  const lines = (cart?.items ?? []).filter((i) => i.quantity > 0);
  const hasBlocked = lines.some((i) => !i.isAvailable);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user || shipId === "" || payId === "") return;
    if (!lines.length) {
      setErr("Sepet boş.");
      toast("Sepet boş", "err");
      return;
    }
    if (hasBlocked) {
      setErr(
        "Bazı ürünler stokta yok veya miktar yetersiz. Sepeti güncelleyin.",
      );
      toast("Sepette sorunlu satır var", "err");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const body = {
        shippingAddressId: shipId,
        paymentMethodId: payId,
        items: lines.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        notes: notes || undefined,
      };
      const r = await apiFetch<Order>("/api/order", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });
      setDone(unwrap(r));
      toast("Siparişin alındı");
      notifyCartChanged();
    } catch (e) {
      const m =
        e instanceof ApiCallError || e instanceof Error
          ? e.message
          : "Sipariş oluşturulamadı";
      setErr(m);
      toast(m, "err");
      const code = e instanceof ApiCallError ? e.errorCode : undefined;
      const reloadCodes = new Set([
        "CART_MISMATCH",
        "CART_UNAVAILABLE",
        "CHECKOUT_FAILED",
        "EMPTY_ORDER",
      ]);
      if (code && reloadCodes.has(code)) {
        await load();
      }
      if (
        !code &&
        (m.includes("Cart") ||
          m.includes("cart") ||
          m.includes("stock") ||
          m.includes("Stok") ||
          m.includes("sepet"))
      ) {
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="p-10 text-center">Yükleniyor…</p>;
  if (!token || !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[var(--ts-ink-muted)]">Ödeme için giriş yap.</p>
        <Link
          href="/login"
          className="mt-4 inline-block text-[var(--ts-coral)] underline"
        >
          Giriş
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ts-mint)]">
          Sipariş alındı
        </h1>
        <p className="mt-2 text-[var(--ts-ink-muted)]">
          No: <strong>{done.orderNumber}</strong>
        </p>
        {(done.subtotalAmount != null || done.shippingFee != null) && (
          <div className="mx-auto mt-4 max-w-xs space-y-1 text-left text-sm text-[var(--ts-ink-muted)]">
            {done.subtotalAmount != null && (
              <div className="flex justify-between gap-4">
                <span>Ara toplam</span>
                <span>{formatMoney(done.subtotalAmount)}</span>
              </div>
            )}
            {done.shippingFee != null && (
              <div className="flex justify-between gap-4">
                <span>Kargo</span>
                <span>
                  {done.shippingFee <= 0
                    ? "Ücretsiz"
                    : formatMoney(done.shippingFee)}
                </span>
              </div>
            )}
          </div>
        )}
        <p className="mt-3 text-lg font-semibold text-[var(--ts-ink)]">
          Toplam: {formatMoney(done.totalAmount)}
        </p>
        <p className="mt-4 text-sm text-[var(--ts-ink-muted)]">
          Onay e-postası (demo) ve kargo güncellemeleri hesap bildirimlerinden
          takip edilir.
        </p>
        <Link href="/account/orders" className="mt-6 inline-block">
          <Button>Siparişlerim</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
        Ödeme
      </h1>
      <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
        Sipariş, sunucudaki sepet ile birebir eşleşmeli. Başka sekmede sepeti
        değiştirdiysen{" "}
        <button
          type="button"
          onClick={() => void load()}
          className="font-medium text-[var(--ts-coral)] underline"
        >
          sepeti yenile
        </button>
        .
      </p>
      <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
        <Link
          href="/account/addresses"
          className="text-[var(--ts-coral)] underline"
        >
          Adres ekle
        </Link>
        {" · "}
        <Link
          href="/account/payment"
          className="text-[var(--ts-coral)] underline"
        >
          Ödeme yöntemi ekle
        </Link>
        {" · "}
        <Link href="/cart" className="text-[var(--ts-coral)] underline">
          Sepete dön
        </Link>
      </p>
      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {err}
        </div>
      )}
      {lines.length > 0 && (
        <ul className="mt-6 space-y-2 rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4 text-sm">
          {lines.map((i) => (
            <li
              key={i.productId}
              className={`flex justify-between gap-2 ${
                !i.isAvailable ? "text-red-700" : ""
              }`}
            >
              <span>
                {i.productName} × {i.quantity}
                {!i.isAvailable && (
                  <span className="ml-2 text-xs font-semibold">
                    (Stok / miktar uyumsuz)
                  </span>
                )}
              </span>
              <span>{formatMoney(i.totalPrice)}</span>
            </li>
          ))}
        </ul>
      )}
      {cart && lines.length > 0 && (
        <div className="mt-4 space-y-1 rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4 text-sm">
          <div className="flex justify-between gap-4 text-[var(--ts-ink-muted)]">
            <span>Ara toplam</span>
            <span>{formatMoney(cart.totalAmount)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[var(--ts-ink-muted)]">
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
                Ücretsiz kargo için {formatMoney(cart.freeShippingRemainingTry)}{" "}
                daha ekleyin.
              </p>
            )}
          <div className="flex justify-between gap-4 border-t border-[var(--ts-border)] pt-2 font-semibold text-[var(--ts-ink)]">
            <span>Ödenecek</span>
            <span>{formatMoney(cart.grandTotal)}</span>
          </div>
        </div>
      )}
      <form onSubmit={submit} className="mt-8 space-y-6">
        <div>
          <Label>Teslimat adresi</Label>
          <select
            className="mt-1 w-full rounded-xl border border-[var(--ts-border)] px-3 py-2.5 text-sm"
            value={shipId}
            onChange={(e) =>
              setShipId(e.target.value ? parseInt(e.target.value, 10) : "")
            }
            required
          >
            <option value="">Seçin</option>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} — {a.city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Ödeme yöntemi</Label>
          <select
            className="mt-1 w-full rounded-xl border border-[var(--ts-border)] px-3 py-2.5 text-sm"
            value={payId}
            onChange={(e) =>
              setPayId(e.target.value ? parseInt(e.target.value, 10) : "")
            }
            required
          >
            <option value="">Seçin</option>
            {payments.map((p) => (
              <option key={p.id} value={p.id}>
                {p.type} · {p.cardNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="notes">Not (isteğe bağlı)</Label>
          <TextArea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={busy || hasBlocked || !lines.length}
        >
          Siparişi tamamla
        </Button>
      </form>
    </div>
  );
}
