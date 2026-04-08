"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch, unwrap } from "@/lib/api";
import type {
  Category,
  PagedProducts,
  Product,
  SubCategory,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/input";
import { formatMoney } from "@/components/price";

export default function AdminCatalogPage() {
  const { token, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ categoryName: "", description: "" });
  const [newSub, setNewSub] = useState({
    subCategoryName: "",
    description: "",
    categoryId: 0,
  });
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [newProd, setNewProd] = useState({
    productName: "",
    unitPrice: 49.99,
    unitInStock: 20,
    quantityPerUnit: "1 adet",
    categoryId: 0,
    description: "",
    discount: 0,
    imageUrl: "",
  });
  const [editing, setEditing] = useState<Product | null>(null);

  const loadCategories = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    try {
      const r = await apiFetch<Category[]>("/api/category", { token });
      setCategories(unwrap(r));
    } catch {
      /* optional */
    }
  }, [token, user?.isAdmin]);

  const loadSubCategories = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    try {
      const r = await apiFetch<SubCategory[]>("/api/subcategory", { token });
      setSubCategories(unwrap(r));
    } catch {
      setSubCategories([]);
    }
  }, [token, user?.isAdmin]);

  const loadProducts = useCallback(async () => {
    if (!token || !user?.isAdmin) return;
    setErr(null);
    try {
      const r = await apiFetch<PagedProducts>(
        `/api/product?pageNumber=${page}&pageSize=15&sortBy=Id&sortOrder=desc`,
        { token },
      );
      const data = unwrap(r);
      setProducts(data.items);
      setTotalPages(Math.max(1, data.totalPages));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ürünler yüklenemedi");
    }
  }, [token, user?.isAdmin, page]);

  useEffect(() => {
    void loadCategories();
    void loadSubCategories();
  }, [loadCategories, loadSubCategories]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (categories.length > 0) {
      setNewProd((p) =>
        p.categoryId === 0 ? { ...p, categoryId: categories[0].id } : p,
      );
      setNewSub((s) =>
        s.categoryId === 0 ? { ...s, categoryId: categories[0].id } : s,
      );
    }
  }, [categories]);

  const toggleCategoryActive = async (c: Category) => {
    if (!token) return;
    try {
      await unwrap(
        await apiFetch<Category>(`/api/category/${c.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify({
            categoryName: c.categoryName,
            description: c.description ?? "",
            imageUrl: c.imageUrl ?? "",
            isActive: !c.isActive,
          }),
        }),
      );
      await loadCategories();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Kategori güncellenemedi");
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await unwrap(
        await apiFetch<Category>("/api/category", {
          method: "POST",
          token,
          body: JSON.stringify({
            categoryName: newCat.categoryName,
            description: newCat.description || undefined,
            isActive: true,
          }),
        }),
      );
      setNewCat({ categoryName: "", description: "" });
      await loadCategories();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const createSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newSub.categoryId) return;
    try {
      await unwrap(
        await apiFetch<SubCategory>("/api/subcategory", {
          method: "POST",
          token,
          body: JSON.stringify({
            subCategoryName: newSub.subCategoryName,
            description: newSub.description || undefined,
            categoryId: newSub.categoryId,
          }),
        }),
      );
      setNewSub((s) => ({ ...s, subCategoryName: "", description: "" }));
      await loadSubCategories();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Alt kategori eklenemedi");
    }
  };

  const saveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingSub) return;
    try {
      await unwrap(
        await apiFetch<SubCategory>(`/api/subcategory/${editingSub.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify({
            id: editingSub.id,
            subCategoryName: editingSub.subCategoryName,
            description: editingSub.description ?? "",
            imageUrl: editingSub.imageUrl ?? "",
            categoryId: editingSub.categoryId,
            isActive: editingSub.isActive,
          }),
        }),
      );
      setEditingSub(null);
      await loadSubCategories();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Alt kategori güncellenemedi");
    }
  };

  const deleteSubCategory = async (id: number) => {
    if (!token) return;
    if (!window.confirm("Bu alt kategoriyi silmek istiyor musunuz?")) return;
    try {
      await unwrap(
        await apiFetch(`/api/subcategory/${id}`, { method: "DELETE", token }),
      );
      if (editingSub?.id === id) setEditingSub(null);
      await loadSubCategories();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Silinemedi");
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newProd.categoryId) return;
    try {
      await unwrap(
        await apiFetch<Product>("/api/product", {
          method: "POST",
          token,
          body: JSON.stringify({
            productName: newProd.productName,
            unitPrice: newProd.unitPrice,
            unitInStock: newProd.unitInStock,
            quantityPerUnit: newProd.quantityPerUnit,
            categoryId: newProd.categoryId,
            description: newProd.description || undefined,
            imageUrl: newProd.imageUrl || undefined,
            discount: newProd.discount,
            isActive: true,
          }),
        }),
      );
      setNewProd((p) => ({
        ...p,
        productName: "",
        unitInStock: 20,
        imageUrl: "",
      }));
      await loadProducts();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editing) return;
    try {
      await unwrap(
        await apiFetch<Product>(`/api/product/${editing.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify({
            id: editing.id,
            productName: editing.productName,
            unitPrice: editing.unitPrice,
            unitInStock: editing.unitInStock,
            quantityPerUnit: editing.quantityPerUnit,
            categoryId: editing.categoryId,
            categoryName: editing.categoryName,
            description: editing.description,
            imageUrl: editing.imageUrl,
            discount: editing.discount,
            isActive: editing.isActive,
            averageRating: editing.averageRating,
            totalReviews: editing.totalReviews,
            createdAt: editing.createdAt,
            updatedAt: editing.updatedAt,
          }),
        }),
      );
      setEditing(null);
      await loadProducts();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Güncellenemedi");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!token) return;
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await unwrap(
        await apiFetch(`/api/product/${id}`, { method: "DELETE", token }),
      );
      if (editing?.id === id) setEditing(null);
      await loadProducts();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Silinemedi");
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--mp-text)]">
          Katalog
        </h1>
        <p className="mt-1 text-sm text-[var(--mp-text-muted)]">
          Kategori, alt kategori ve ürün yönetimi (admin token gerekir).
        </p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}

      <section className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Kategoriler</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--mp-border)] px-3 py-2"
            >
              <span>
                {c.categoryName}{" "}
                {!c.isActive && (
                  <span className="text-[var(--mp-text-faint)]">(pasif)</span>
                )}
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => toggleCategoryActive(c)}
              >
                {c.isActive ? "Pasifleştir" : "Aktifleştir"}
              </Button>
            </li>
          ))}
        </ul>
        <form
          onSubmit={createCategory}
          className="mt-6 grid gap-3 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label>Yeni kategori adı</Label>
            <Input
              required
              value={newCat.categoryName}
              onChange={(e) =>
                setNewCat((x) => ({ ...x, categoryName: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Açıklama</Label>
            <Input
              value={newCat.description}
              onChange={(e) =>
                setNewCat((x) => ({ ...x, description: e.target.value }))
              }
            />
          </div>
          <Button type="submit" size="sm">
            Kategori ekle
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Alt kategoriler</h2>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
          {subCategories.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--mp-border)] px-3 py-2"
            >
              <span className="text-[var(--mp-text-muted)]">
                {s.subCategoryName}{" "}
                <span className="text-[var(--mp-text-faint)]">
                  ({s.categoryName})
                </span>
                {!s.isActive && (
                  <span className="text-[var(--mp-text-faint)]"> pasif</span>
                )}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingSub({ ...s })}
                >
                  Düzenle
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => deleteSubCategory(s.id)}
                >
                  Sil
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {editingSub && (
          <form
            onSubmit={saveSubCategory}
            className="mt-6 grid gap-3 rounded-xl border border-[var(--mp-orange)] bg-[var(--mp-orange-soft)] p-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2 flex justify-between">
              <h3 className="font-semibold">Alt kategori #{editingSub.id}</h3>
              <button
                type="button"
                className="text-sm underline text-[var(--mp-text-muted)]"
                onClick={() => setEditingSub(null)}
              >
                Kapat
              </button>
            </div>
            <div className="sm:col-span-2">
              <Label>Ad</Label>
              <Input
                required
                value={editingSub.subCategoryName}
                onChange={(e) =>
                  setEditingSub({
                    ...editingSub,
                    subCategoryName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Üst kategori</Label>
              <select
                className="mt-1 w-full rounded-xl border border-[var(--mp-border)] px-3 py-2 text-sm"
                value={editingSub.categoryId}
                onChange={(e) =>
                  setEditingSub({
                    ...editingSub,
                    categoryId: parseInt(e.target.value, 10),
                  })
                }
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="sub-active"
                type="checkbox"
                checked={editingSub.isActive}
                onChange={(e) =>
                  setEditingSub({ ...editingSub, isActive: e.target.checked })
                }
              />
              <label htmlFor="sub-active" className="text-sm">
                Aktif
              </label>
            </div>
            <div className="sm:col-span-2">
              <Label>Açıklama</Label>
              <Input
                value={editingSub.description ?? ""}
                onChange={(e) =>
                  setEditingSub({ ...editingSub, description: e.target.value })
                }
              />
            </div>
            <Button type="submit" size="sm">
              Kaydet
            </Button>
          </form>
        )}
        <form
          onSubmit={createSubCategory}
          className="mt-6 grid gap-3 sm:grid-cols-2"
        >
          <div>
            <Label>Üst kategori</Label>
            <select
              className="mt-1 w-full rounded-xl border border-[var(--mp-border)] px-3 py-2 text-sm"
              value={newSub.categoryId || ""}
              onChange={(e) =>
                setNewSub((s) => ({
                  ...s,
                  categoryId: parseInt(e.target.value, 10) || 0,
                }))
              }
              required
            >
              <option value="">Seçin</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Alt kategori adı</Label>
            <Input
              required
              value={newSub.subCategoryName}
              onChange={(e) =>
                setNewSub((s) => ({ ...s, subCategoryName: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Açıklama</Label>
            <Input
              value={newSub.description}
              onChange={(e) =>
                setNewSub((s) => ({ ...s, description: e.target.value }))
              }
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Alt kategori ekle
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Ürünler</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--mp-border)] text-[var(--mp-text-muted)]">
                <th className="py-2 pr-2 font-medium">ID</th>
                <th className="py-2 pr-2 font-medium">Ad</th>
                <th className="py-2 pr-2 font-medium">Fiyat</th>
                <th className="py-2 pr-2 font-medium">Stok</th>
                <th className="py-2 pr-2 font-medium">Durum</th>
                <th className="py-2 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--mp-border)] last:border-0"
                >
                  <td className="py-2 pr-2 font-mono text-xs">{p.id}</td>
                  <td className="py-2 pr-2">{p.productName}</td>
                  <td className="py-2 pr-2">{formatMoney(p.unitPrice)}</td>
                  <td className="py-2 pr-2">{p.unitInStock}</td>
                  <td className="py-2 pr-2">
                    {p.isActive ? "Aktif" : "Pasif"}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditing(p)}
                      >
                        Düzenle
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => deleteProduct(p.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((x) => Math.max(1, x - 1))}
          >
            Önceki
          </Button>
          <span className="text-sm text-[var(--mp-text-muted)]">
            Sayfa {page} / {totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
          >
            Sonraki
          </Button>
        </div>

        {editing && (
          <form
            onSubmit={saveProduct}
            className="mt-8 grid gap-3 rounded-xl border border-[var(--mp-orange)] bg-[var(--mp-orange-soft)] p-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2 flex items-center justify-between">
              <h3 className="font-semibold">Ürün düzenle #{editing.id}</h3>
              <button
                type="button"
                className="text-sm text-[var(--mp-text-muted)] underline"
                onClick={() => setEditing(null)}
              >
                Kapat
              </button>
            </div>
            <div className="sm:col-span-2">
              <Label>Ad</Label>
              <Input
                required
                value={editing.productName}
                onChange={(e) =>
                  setEditing({ ...editing, productName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Fiyat</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={editing.unitPrice}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Stok</Label>
              <Input
                type="number"
                required
                value={editing.unitInStock}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    unitInStock: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <select
                className="mt-1 w-full rounded-xl border border-[var(--mp-border)] px-3 py-2 text-sm"
                value={editing.categoryId}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    categoryId: parseInt(e.target.value, 10),
                  })
                }
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>İndirim %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={editing.discount}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    discount: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="edit-active"
                type="checkbox"
                checked={editing.isActive}
                onChange={(e) =>
                  setEditing({ ...editing, isActive: e.target.checked })
                }
              />
              <label htmlFor="edit-active" className="text-sm">
                Aktif
              </label>
            </div>
            <div className="sm:col-span-2">
              <Label>Görsel URL</Label>
              <Input
                value={editing.imageUrl ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    imageUrl: e.target.value || undefined,
                  })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Açıklama</Label>
              <TextArea
                rows={2}
                value={editing.description ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </div>
            <Button type="submit" size="sm">
              Kaydet
            </Button>
          </form>
        )}

        <form
          onSubmit={createProduct}
          className="mt-8 grid gap-3 border-t border-[var(--mp-border)] pt-8 sm:grid-cols-2"
        >
          <h3 className="sm:col-span-2 text-sm font-semibold text-[var(--mp-text-muted)]">
            Yeni ürün
          </h3>
          <div>
            <Label>Kategori</Label>
            <select
              className="mt-1 w-full rounded-xl border border-[var(--mp-border)] px-3 py-2 text-sm"
              value={newProd.categoryId || ""}
              onChange={(e) =>
                setNewProd((p) => ({
                  ...p,
                  categoryId: parseInt(e.target.value, 10) || 0,
                }))
              }
              required
            >
              <option value="">Seçin</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Ürün adı</Label>
            <Input
              required
              value={newProd.productName}
              onChange={(e) =>
                setNewProd((p) => ({ ...p, productName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Fiyat</Label>
            <Input
              type="number"
              step="0.01"
              required
              value={newProd.unitPrice}
              onChange={(e) =>
                setNewProd((p) => ({
                  ...p,
                  unitPrice: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div>
            <Label>Stok</Label>
            <Input
              type="number"
              required
              value={newProd.unitInStock}
              onChange={(e) =>
                setNewProd((p) => ({
                  ...p,
                  unitInStock: parseInt(e.target.value, 10) || 0,
                }))
              }
            />
          </div>
          <div>
            <Label>Birim</Label>
            <Input
              value={newProd.quantityPerUnit}
              onChange={(e) =>
                setNewProd((p) => ({ ...p, quantityPerUnit: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>İndirim %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={newProd.discount}
              onChange={(e) =>
                setNewProd((p) => ({
                  ...p,
                  discount: parseInt(e.target.value, 10) || 0,
                }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Görsel URL</Label>
            <Input
              value={newProd.imageUrl}
              onChange={(e) =>
                setNewProd((p) => ({ ...p, imageUrl: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Açıklama</Label>
            <Input
              value={newProd.description}
              onChange={(e) =>
                setNewProd((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Ürün ekle
          </Button>
        </form>
      </section>
    </div>
  );
}
