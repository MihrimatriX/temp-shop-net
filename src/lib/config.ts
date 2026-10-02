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

/**
 * Sunucu tarafı (SSR) isteklerinin adresi — `server-api.ts` ve `/dev/status` kullanır.
 * Docker'da konteyner içindeki "localhost" API değil konteynerin kendisidir;
 * bu yüzden tarayıcı adresinden (API_BASE) ayrı ayarlanabilmeli: `API_INTERNAL_URL`.
 */
// TODO(human): export const SERVER_API_BASE = ...

export const TOKEN_KEY = "temp-shop-token";
