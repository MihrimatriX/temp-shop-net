import { API_BASE } from "./config";
import type { BaseResponse } from "./types";

export async function serverFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number },
): Promise<T | null> {
  const { revalidate, ...rest } = init ?? {};
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: { Accept: "application/json", ...rest.headers },
      next: revalidate !== undefined ? { revalidate } : { revalidate: 30 },
    });
    const j = (await res.json()) as BaseResponse<T>;
    if (!j.success || j.data === undefined || j.data === null) return null;
    return j.data;
  } catch {
    return null;
  }
}
