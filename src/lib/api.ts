import { API_BASE } from "./config";
import type { BaseResponse } from "./types";

/** API `success: false` veya ağ/parse hataları için */
export class ApiCallError extends Error {
  readonly status: number;
  readonly errorCode?: string;

  constructor(
    message: string,
    opts: { status: number; errorCode?: string } = { status: 0 },
  ) {
    super(message);
    this.name = "ApiCallError";
    this.status = opts.status;
    this.errorCode = opts.errorCode;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<{ ok: boolean; status: number; json: BaseResponse<T> | null }> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const body = options.body;
  if (body && typeof body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  } else if (
    body &&
    !(body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const { token, ...rest } = options;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers });
  } catch (cause) {
    const msg =
      cause instanceof Error
        ? `Bağlantı hatası: ${cause.message}`
        : "Ağ hatası: sunucuya ulaşılamadı.";
    throw new ApiCallError(msg, { status: 0 });
  }

  const text = await res.text();
  let json: BaseResponse<T> | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as BaseResponse<T>;
    } catch {
      json = null;
    }
  }
  return { ok: res.ok, status: res.status, json };
}

export function unwrap<T>(r: {
  ok: boolean;
  status: number;
  json: BaseResponse<T> | null;
}): T {
  if (!r.json) {
    throw new ApiCallError(`Sunucu yanıtı okunamadı (HTTP ${r.status}).`, {
      status: r.status,
    });
  }
  if (!r.json.success) {
    throw new ApiCallError(
      r.json.message || r.json.error || `İşlem başarısız (HTTP ${r.status})`,
      { status: r.status, errorCode: r.json.errorCode },
    );
  }
  if (r.json.data === undefined || r.json.data === null) {
    throw new ApiCallError(r.json.message || "Beklenen veri dönmedi.", {
      status: r.status,
      errorCode: r.json.errorCode,
    });
  }
  return r.json.data;
}

export function effectiveUnitPrice(p: { unitPrice: number; discount: number }) {
  const d = Math.min(100, Math.max(0, p.discount));
  return p.unitPrice * (1 - d / 100);
}
