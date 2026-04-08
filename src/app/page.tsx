import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import type { Campaign, Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { ChevronRight, Zap } from "lucide-react";

export const revalidate = 30;

export default async function HomePage() {
  const [activeCampaigns, featured, discounted, categories] = await Promise.all(
    [
      serverFetch<Campaign[]>("/api/campaign/active"),
      serverFetch<Product[]>("/api/product/featured"),
      serverFetch<Product[]>("/api/product/discounted"),
      serverFetch<Category[]>("/api/category"),
    ],
  );

  const campaigns = activeCampaigns ?? [];
  const feat = featured ?? [];
  const disc = discounted ?? [];
  const cats = categories ?? [];

  return (
    <div className="bg-[var(--mp-bg)]">
      {/* Kampanya şeridi — geniş kartlar */}
      {campaigns.length > 0 && (
        <section className="border-b border-[var(--mp-border)] bg-[var(--mp-surface)] py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-[var(--mp-text)]">
                <Zap className="h-5 w-5 text-[var(--mp-orange)]" />
                Günün fırsatları
              </h2>
              <Link
                href="/campaigns"
                className="flex items-center gap-0.5 text-sm font-semibold text-[var(--mp-orange)] hover:underline"
              >
                Tüm kampanyalar
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mp-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {campaigns.map((c) => {
                const href = c.buttonHref?.trim() || "/products";
                const external = href.startsWith("http");
                const inner = (
                  <article
                    className="flex h-36 w-[min(100%,320px)] shrink-0 snap-start flex-col justify-center rounded-lg border border-black/5 px-5 shadow-md sm:h-40 sm:w-[380px]"
                    style={{
                      background: c.backgroundColor
                        ? `linear-gradient(135deg, ${c.backgroundColor} 0%, color-mix(in srgb, ${c.backgroundColor} 75%, black) 100%)`
                        : "linear-gradient(135deg, #f27a1a 0%, #c2410c 100%)",
                    }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-white/90">
                      %{c.discount} indirim
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-lg font-extrabold leading-tight text-white">
                      {c.title}
                    </h3>
                    {c.subtitle && (
                      <p className="mt-1 line-clamp-2 text-sm text-white/85">
                        {c.subtitle}
                      </p>
                    )}
                    {c.buttonText && (
                      <span className="mt-3 inline-flex items-center text-sm font-bold text-white underline decoration-2">
                        {c.buttonText}
                      </span>
                    )}
                  </article>
                );
                return external ? (
                  <a
                    key={c.id}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link key={c.id} href={href} className="shrink-0">
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        {/* Kategori kutuları */}
        {cats.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-extrabold text-[var(--mp-text)]">
                Kategorilere göz at
              </h2>
              <Link
                href="/categories"
                className="text-sm font-semibold text-[var(--mp-orange)] hover:underline"
              >
                Hepsi
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {cats.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  href={`/products?categoryId=${c.id}`}
                  className="flex flex-col items-center rounded-lg border border-[var(--mp-border)] bg-[var(--mp-surface)] p-4 text-center transition hover:border-[var(--mp-orange)] hover:shadow-md"
                >
                  <div className="mb-2 h-14 w-14 overflow-hidden rounded-full bg-[var(--mp-bg)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        c.imageUrl ||
                        `https://picsum.photos/seed/cat${c.id}/112/112`
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="line-clamp-2 text-xs font-semibold text-[var(--mp-text)]">
                    {c.categoryName}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {feat.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-extrabold text-[var(--mp-text)]">
                Sana özel seçilenler
              </h2>
              <Link
                href="/products?sortBy=Id&sortOrder=desc"
                className="text-sm font-semibold text-[var(--mp-orange)] hover:underline"
              >
                Daha fazla
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {feat.slice(0, 12).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {disc.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-extrabold text-[var(--mp-text)]">
                İndirimli ürünler
              </h2>
              <Link
                href="/products"
                className="text-sm font-semibold text-[var(--mp-orange)] hover:underline"
              >
                Tümünü gör
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {disc.slice(0, 18).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {feat.length === 0 && disc.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--mp-border)] bg-[var(--mp-surface)] py-16 text-center">
            <p className="text-[var(--mp-text-muted)]">
              Ürünler yüklenemedi. API’nin ayakta olduğundan emin olun.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block font-semibold text-[var(--mp-orange)] hover:underline"
            >
              Ürün listesine git
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
