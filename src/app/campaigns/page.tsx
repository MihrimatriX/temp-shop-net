import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { Campaign } from "@/lib/types";

export default async function CampaignsPage() {
  const list = await serverFetch<Campaign[]>("/api/campaign");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ts-ink)]">
        Kampanyalar
      </h1>
      <p className="mt-2 text-[var(--ts-ink-muted)]">
        API:{" "}
        <code className="rounded bg-[var(--ts-sand)] px-1">
          GET /api/campaign
        </code>{" "}
        ve{" "}
        <code className="rounded bg-[var(--ts-sand)] px-1">
          /api/campaign/active
        </code>
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {(list ?? []).map((c) => {
          const href = c.buttonHref?.trim() || "/products";
          const external = href.startsWith("http");
          const Inner = (
            <article
              className="h-full overflow-hidden rounded-2xl border border-[var(--ts-border)] shadow-md transition hover:-translate-y-0.5"
              style={{
                backgroundColor: c.backgroundColor || "#faf7f2",
              }}
            >
              <div className="p-8">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  %{c.discount}
                </span>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
                  {c.title}
                </h2>
                {c.subtitle && (
                  <p className="mt-2 text-sm opacity-90">{c.subtitle}</p>
                )}
                {c.description && (
                  <p className="mt-4 text-sm leading-relaxed opacity-85">
                    {c.description}
                  </p>
                )}
                {c.timeLeft && (
                  <p className="mt-4 text-xs font-medium uppercase opacity-75">
                    {c.timeLeft}
                  </p>
                )}
                {c.buttonText && (
                  <span className="mt-6 inline-block text-sm font-semibold underline">
                    {c.buttonText} →
                  </span>
                )}
              </div>
            </article>
          );
          return external ? (
            <a key={c.id} href={href} target="_blank" rel="noreferrer">
              {Inner}
            </a>
          ) : (
            <Link key={c.id} href={href}>
              {Inner}
            </Link>
          );
        })}
      </div>
      {!list?.length && (
        <p className="mt-10 text-center text-[var(--ts-ink-muted)]">
          Kampanya bulunamadı.
        </p>
      )}
    </div>
  );
}
