"use client";

import React from "react";
import Image from "next/image";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Category, Product, Season } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { exportProductsToExcel, importProductsFromExcel } from "@/lib/excel/products";
import { toast } from "sonner";
import { formatEGP, computeModelGroup } from "@/lib/utils";

function nowISO() {
  return new Date().toISOString();
}

export default function AdminProductsPage() {
  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [editing, setEditing] = React.useState<Product | null>(null);

  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [modelNumber, setModelNumber] = React.useState<string>("");
  const [price, setPrice] = React.useState<number>(0);
  const [salePrice, setSalePrice] = React.useState<string>("");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [seasonId, setSeasonId] = React.useState<string>("");
  const [active, setActive] = React.useState(true);
  const [images, setImages] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  async function refresh() {
    setLoading(true);
    const [pSnap, cSnap, sSnap] = await Promise.all([
      getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))),
      getDocs(query(collection(db, "categories"), orderBy("sort", "asc"))),
      getDocs(query(collection(db, "seasons"), orderBy("sort", "asc"))),
    ]);
    setProducts(pSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    const cats = cSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    const seas = sSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    setCategories(cats);
    setSeasons(seas);
    setCategoryId((x) => x || cats[0]?.id || "");
    setSeasonId((x) => x || seas[0]?.id || "");
    setLoading(false);
  }

  React.useEffect(() => {
    void refresh();
  }, []);

  function resetForm() {
    setEditing(null);
    setName("");
    setSku("");
    setPrice(0);
    setSalePrice("");
    setActive(true);
    setImages([]);
  }

  function startEdit(p: Product) {
    setEditing(p);
    setName(p.name);
    setSku(p.sku || "");
    setModelNumber(p.modelNumber ? String(p.modelNumber) : "");
    setPrice(p.price);
    setSalePrice(p.salePrice == null ? "" : String(p.salePrice));
    setCategoryId(p.categoryId);
    setSeasonId(p.seasonId);
    setActive(p.active);
    setImages(p.images || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!name.trim()) return toast.error("اسم المنتج مطلوب");
    if (!categoryId) return toast.error("اختر التصنيف");
    if (!seasonId) return toast.error("اختر الموسم");
    if (price <= 0) return toast.error("السعر غير صحيح");

    setBusy(true);
    try {
      const payload: any = {
        name: name.trim(),
        sku: sku.trim() || null,
        modelNumber: modelNumber.trim() === "" ? null : Number(modelNumber),
        modelGroup: computeModelGroup(modelNumber.trim() === "" ? null : Number(modelNumber)),
        price: Number(price),
        salePrice: salePrice.trim() === "" ? null : Number(salePrice),
        categoryId,
        seasonId,
        images,
        active,
        updatedAt: nowISO(),
      };

      if (editing) {
        await updateDoc(doc(db, "products", editing.id), payload);
        toast.success("تم تحديث المنتج");
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: nowISO(),
        });
        toast.success("تمت إضافة المنتج");
      }
      resetForm();
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "تعذر الحفظ");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Product) {
    if (!confirm("تأكيد حذف المنتج؟")) return;
    try {
      await deleteDoc(doc(db, "products", p.id));
      toast.success("تم الحذف");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "تعذر الحذف");
    }
  }

  async function onPickImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const f of Array.from(files)) {
        const url = await uploadToCloudinary(f);
        uploaded.push(url);
      }
      setImages((s) => [...s, ...uploaded]);
      toast.success("تم رفع الصور");
    } catch (e: any) {
      toast.error(e?.message || "تعذر رفع الصور");
    } finally {
      setBusy(false);
    }
  }

  async function importExcel(file: File) {
    setBusy(true);
    try {
      const rows = await importProductsFromExcel(file);
      const batch = writeBatch(db);

      for (const r of rows) {
        const id = (r as any).id as string;
        const data: any = {
          name: r.name || "",
          sku: r.sku || null,
          price: Number(r.price || 0),
          salePrice: (r as any).salePrice ?? null,
          categoryId: r.categoryId || categoryId,
          seasonId: r.seasonId || seasonId,
          images: r.images || [],
          sizes: (r as any).sizes || [],
          colors: (r as any).colors || [],
          stock: (r as any).stock ?? null,
          active: Boolean(r.active),
          updatedAt: nowISO(),
        };

        if (id) {
          batch.set(doc(db, "products", id), { ...data, createdAt: nowISO() }, { merge: true });
        } else {
          const newRef = doc(collection(db, "products"));
          batch.set(newRef, { ...data, createdAt: nowISO() }, { merge: true });
        }
      }

      await batch.commit();
      toast.success("تم استيراد المنتجات من Excel");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "تعذر الاستيراد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="font-bold">{editing ? "تعديل منتج" : "إضافة منتج جديد"}</div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportProductsToExcel(products)}>تصدير Excel</Button>
            <label className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-4 py-2 text-sm cursor-pointer hover:bg-zinc-200">
              استيراد Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importExcel(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="اسم المنتج" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="SKU (اختياري)" value={sku} onChange={(e) => setSku(e.target.value)} />
              <Input placeholder="رقم الموديل (اختياري) — مثال 1250" inputMode="numeric" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} />
            <Input placeholder="السعر" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            <Input placeholder="سعر التخفيض (اختياري)" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />

            <select className="h-10 rounded-2xl border border-zinc-200 px-3 text-sm" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="h-10 rounded-2xl border border-zinc-200 px-3 text-sm" value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
              {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              المنتج نشط
            </label>

            <label className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 px-4 py-2 text-sm cursor-pointer hover:bg-zinc-50">
              رفع صور (Cloudinary)
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => void onPickImages(e.target.files)} />
            </label>
          </div>

          {images.length ? (
            <div className="flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative h-20 w-20 rounded-2xl overflow-hidden border border-zinc-200">
                  <Image src={url} alt="img" fill className="object-cover" sizes="80px" />
                  <button
                    className="absolute top-1 left-1 bg-white/90 rounded-full px-2 text-xs"
                    onClick={() => setImages((s) => s.filter((_, i) => i !== idx))}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button onClick={save} disabled={busy}>{busy ? "جاري…" : (editing ? "حفظ التعديل" : "إضافة المنتج")}</Button>
            {editing ? <Button variant="secondary" onClick={resetForm}>إلغاء</Button> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="font-bold">قائمة المنتجات</div>
          <Badge>{products.length}</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-zinc-600">جاري التحميل…</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-zinc-600">لا توجد منتجات.</div>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100">
                      <Image src={p.images?.[0] || "/placeholder.png"} alt={p.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-zinc-600">{formatEGP(p.salePrice ?? p.price)} • {p.active ? "نشط" : "مخفي"}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => startEdit(p)}>تعديل</Button>
                    <Button variant="danger" size="sm" onClick={() => void remove(p)}>حذف</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
