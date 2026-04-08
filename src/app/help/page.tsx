import { serverFetch } from "@/lib/server-api";
import type { Faq, HelpArticle } from "@/lib/types";
import { ContactForm } from "./contact-form";
import Link from "next/link";

export default async function HelpPage() {
  const [articles, faqs] = await Promise.all([
    serverFetch<HelpArticle[]>("/api/helpsupport/articles?pageSize=20"),
    serverFetch<Faq[]>("/api/helpsupport/faqs?pageSize=30"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ts-ink)]">
        Yardım merkezi
      </h1>
      <p className="mt-2 text-[var(--ts-ink-muted)]">
        Makaleler, SSS ve iletişim — giriş yapan kullanıcılar{" "}
        <Link href="/account/help" className="text-[var(--ts-coral)] underline">
          destek talebi
        </Link>{" "}
        de açabilir.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Makaleler</h2>
        <ul className="mt-4 space-y-3">
          {(articles ?? []).map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4"
            >
              <p className="font-medium text-[var(--ts-ink)]">{a.title}</p>
              <p className="mt-1 text-xs uppercase text-[var(--ts-ink-faint)]">
                {a.category}
              </p>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--ts-ink-muted)]">
                {a.content}
              </p>
            </li>
          ))}
        </ul>
        {!articles?.length && (
          <p className="mt-4 text-sm text-[var(--ts-ink-muted)]">
            Makale bulunamadı.
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Sık sorulan sorular</h2>
        <ul className="mt-4 space-y-3">
          {(faqs ?? []).map((f) => (
            <li
              key={f.id}
              className="rounded-xl border border-[var(--ts-border)] bg-[var(--ts-surface)] p-4"
            >
              <p className="font-medium text-[var(--ts-ink)]">{f.question}</p>
              <p className="mt-2 text-sm text-[var(--ts-ink-muted)]">
                {f.answer}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 max-w-xl">
        <ContactForm />
      </div>
    </div>
  );
}
