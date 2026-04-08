"use client";

import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/context/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
