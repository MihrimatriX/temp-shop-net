"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { notifyCartChanged, useToast } from "@/context/toast-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/input";

export function ProductDetailClient({ product }: { product: Product }) {
  const { token, user } = useAuth();
  const { show: toast } = useToast();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [fav, setFav] = useState<boolean | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!token || !user) {
      setFav(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await apiFetch<boolean>(`/api/favorite/check/${product.id}`, {
          token,
        });
        if (!cancelled && r.json?.success && r.json.data !== undefined) {
          setFav(r.json.data);
        }
      } catch {
        if (!cancelled) setFav(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user, product.id]);

  const addCart = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await unwrap(
        await apiFetch("/api/cart/add", {
          method: "POST",
          token,
          body: JSON.stringify({ productId: product.id, quantity: qty }),
        }),
      );
      setMsg("Sepete eklendi.");
      toast("Sepete eklendi");
      notifyCartChanged();
      router.refresh();
    } catch (e) {
      const m = e instanceof Error ? e.message : "Hata";
      setMsg(m);
      toast(m, "err");
    } finally {
      setBusy(false);
    }
  };

  const toggleFav = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      if (fav) {
        await unwrap(
          await apiFetch(`/api/favorite/remove/${product.id}`, {
            method: "DELETE",
            token,
          }),
        );
        setFav(false);
        setMsg("Favorilerden çıkarıldı.");
        toast("Favorilerden çıkarıldı");
      } else {
        await unwrap(
          await apiFetch("/api/favorite/add", {
            method: "POST",
            token,
            body: JSON.stringify({ productId: product.id }),
          }),
        );
        setFav(true);
        setMsg("Favorilere eklendi.");
        toast("Favorilere eklendi");
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : "Hata";
      setMsg(m);
      toast(m, "err");
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await unwrap(
        await apiFetch("/api/review", {
          method: "POST",
          token,
          body: JSON.stringify({
            productId: product.id,
            rating,
            title: title || undefined,
            comment: comment || undefined,
          }),
        }),
      );
      setTitle("");
      setComment("");
      setMsg("Yorum gönderildi.");
      toast("Yorumun yayında");
      router.refresh();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Hata";
      setMsg(m);
      toast(
        m.includes("already reviewed")
          ? "Bu ürün için zaten yorumun var; düzenleyebilir veya silebilirsin."
          : m,
        "err",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {product.unitInStock < 1 ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Bu ürün şu an stokta yok; sepete eklenemez.
        </p>
      ) : product.unitInStock <= 5 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Stokta son {product.unitInStock} adet kaldı.
        </p>
      ) : null}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label htmlFor="qty">Adet</Label>
          <Input
            id="qty"
            type="number"
            min={1}
            max={Math.max(1, product.unitInStock)}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
            className="w-24"
          />
        </div>
        <Button
          size="lg"
          disabled={busy || product.unitInStock < 1}
          onClick={addCart}
          className="gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Sepete ekle
        </Button>
        <Button
          size="lg"
          variant={fav ? "primary" : "secondary"}
          disabled={busy}
          onClick={toggleFav}
          className="gap-2"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
          Favori
        </Button>
      </div>
      {msg && <p className="text-sm text-[var(--ts-mint)]">{msg}</p>}

      {token && (
        <form
          onSubmit={submitReview}
          className="rounded-2xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-6"
        >
          <h3 className="font-medium text-[var(--ts-ink)]">Yorum yaz</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="rating">Puan</Label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-xl border border-[var(--ts-border)] px-3 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} yıldız
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="rtitle">Başlık (isteğe bağlı)</Label>
              <Input
                id="rtitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="rcomment">Yorum</Label>
            <TextArea
              id="rcomment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <Button type="submit" className="mt-4" disabled={busy}>
            Gönder
          </Button>
        </form>
      )}
    </div>
  );
}
