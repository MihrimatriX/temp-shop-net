"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "ok" | "err";

type ToastItem = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = "ok") => {
    const id = Date.now() + Math.random();
    setItems((t) => [...t, { id, message, type }]);
    window.setTimeout(() => {
      setItems((t) => t.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              t.type === "ok"
                ? "border-[var(--ts-mint)]/40 bg-[var(--ts-mint)]/10 text-[var(--ts-ink)]"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast requires ToastProvider");
  return ctx;
}

/** Sepet / ödeme sonrası üst bardaki sayacı yenilemek için */
export function notifyCartChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("temp-shop-cart-changed"));
  }
}
