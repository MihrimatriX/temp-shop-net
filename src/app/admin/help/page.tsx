"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type { Faq, HelpArticle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/input";

export default function AdminHelpPage() {
  const { token, user } = useAuth();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    category: "Genel",
    tagsText: "",
    isPublished: true,
  });

  const load = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    setErr(null);
    try {
      const [a, f] = await Promise.all([
        apiFetch<HelpArticle[]>("/api/helpsupport/articles?pageSize=100", {}),
        apiFetch<Faq[]>("/api/helpsupport/faqs?pageSize=100", {}),
      ]);
      setArticles(unwrap(a));
      setFaqs(unwrap(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Yüklenemedi");
    }
  }, [token, user?.isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const createArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const tags = articleForm.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await unwrap(
        await apiFetch<HelpArticle>("/api/helpsupport/articles", {
          method: "POST",
          token,
          body: JSON.stringify({
            title: articleForm.title,
            content: articleForm.content,
            category: articleForm.category,
            tags,
            isPublished: articleForm.isPublished,
          }),
        }),
      );
      setArticleForm({
        title: "",
        content: "",
        category: "Genel",
        tagsText: "",
        isPublished: true,
      });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Makale eklenemedi");
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Yardım &amp; SSS
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          <code className="rounded bg-[var(--ts-sand)] px-1">
            GET/POST /api/helpsupport/articles
          </code>{" "}
          ve{" "}
          <code className="rounded bg-[var(--ts-sand)] px-1">
            GET /api/helpsupport/faqs
          </code>{" "}
          (SSS oluşturma API’de henüz yok).
        </p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}

      <section className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Yeni yardım makalesi (admin)</h2>
        <form onSubmit={createArticle} className="mt-4 space-y-3">
          <div>
            <Label>Başlık</Label>
            <Input
              required
              value={articleForm.title}
              onChange={(e) =>
                setArticleForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Kategori</Label>
            <Input
              required
              value={articleForm.category}
              onChange={(e) =>
                setArticleForm((f) => ({ ...f, category: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Etiketler (virgülle)</Label>
            <Input
              value={articleForm.tagsText}
              onChange={(e) =>
                setArticleForm((f) => ({ ...f, tagsText: e.target.value }))
              }
              placeholder="hesap, kargo"
            />
          </div>
          <div>
            <Label>İçerik</Label>
            <TextArea
              required
              rows={5}
              value={articleForm.content}
              onChange={(e) =>
                setArticleForm((f) => ({ ...f, content: e.target.value }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={articleForm.isPublished}
              onChange={(e) =>
                setArticleForm((f) => ({ ...f, isPublished: e.target.checked }))
              }
            />
            Yayında
          </label>
          <Button type="submit" size="sm">
            Makale oluştur
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Makaleler (liste)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {articles.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-[var(--mp-border)] bg-[var(--mp-surface)] px-3 py-2"
            >
              <span className="font-medium">{a.title}</span>
              <span className="text-[var(--mp-text-muted)]">
                {" "}
                — {a.category}
              </span>
              {!a.isPublished && (
                <span className="text-[var(--mp-text-faint)]"> (taslak)</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">SSS (salt okunur)</h2>
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
          {faqs.map((f) => (
            <li
              key={f.id}
              className="rounded-xl border border-[var(--mp-border)] bg-[var(--mp-surface)] px-3 py-2"
            >
              <p className="font-medium">{f.question}</p>
              <p className="mt-1 text-[var(--mp-text-muted)]">{f.answer}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
