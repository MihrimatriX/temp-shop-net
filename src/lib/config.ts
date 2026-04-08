function readRuntimeApiBase(): string | null {
  if (typeof window === "undefined") return null;
  const rt = (globalThis as unknown as { __RUNTIME_CONFIG__?: unknown })
    .__RUNTIME_CONFIG__;
  if (!rt || typeof rt !== "object") return null;
  const v = (rt as { NEXT_PUBLIC_API_URL?: unknown }).NEXT_PUBLIC_API_URL;
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed ? trimmed : null;
}

export const API_BASE = (readRuntimeApiBase() ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000"
).replace(/\/$/, "");

export const TOKEN_KEY = "temp-shop-token";
