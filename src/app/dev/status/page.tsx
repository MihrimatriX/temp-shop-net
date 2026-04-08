import { API_BASE } from "@/lib/config";

async function fetchJson(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    try {
      return { ok: res.ok, status: res.status, body: JSON.parse(text) };
    } catch {
      return { ok: res.ok, status: res.status, body: text };
    }
  } catch (e) {
    return {
      ok: false,
      status: 0,
      body: e instanceof Error ? e.message : "error",
    };
  }
}

export default async function DevStatusPage() {
  const hello = await fetchJson("/api/test/hello");
  const health = await fetchJson("/api/test/health");
  const metrics = await fetchJson("/api/metrics/custom");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        API durumu
      </h1>
      <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
        Backend:{" "}
        <code className="rounded bg-[var(--ts-sand)] px-1">{API_BASE}</code>
      </p>
      <div className="mt-8 space-y-6">
        <section>
          <h2 className="font-medium">GET /api/test/hello</h2>
          <pre className="mt-2 overflow-auto rounded-xl bg-[var(--ts-ink)] p-4 text-xs text-[var(--ts-cream)]">
            {JSON.stringify(hello, null, 2)}
          </pre>
        </section>
        <section>
          <h2 className="font-medium">GET /api/test/health</h2>
          <pre className="mt-2 overflow-auto rounded-xl bg-[var(--ts-ink)] p-4 text-xs text-[var(--ts-cream)]">
            {JSON.stringify(health, null, 2)}
          </pre>
        </section>
        <section>
          <h2 className="font-medium">GET /api/metrics/custom</h2>
          <pre className="mt-2 overflow-auto rounded-xl bg-[var(--ts-ink)] p-4 text-xs text-[var(--ts-cream)]">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
