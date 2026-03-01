"use client";

import React from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Product, Category, Season } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatEGP, cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { toast } from "sonner";
import { LightboxImage } from "@/components/Lightbox";

export default function ProductsPage() {
  const add = useCartStore((s) => s.add);
  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [qText, setQText] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("all");
  const [seasonId, setSeasonId] = React.useState<string>("all");

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const [pSnap, cSnap, sSnap] = await Promise.all([
        getDocs(query(collection(db, "products"), where("active", "==", true), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "categories"), orderBy("sort", "asc"))),
        getDocs(query(collection(db, "seasons"), orderBy("sort", "asc"))),
      ]);
      setProducts(pSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setCategories(cSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setSeasons(sSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setLoading(false);
    }
    void load();
  }, []);

  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      const matchText = qText.trim()
        ? (p.name || "").toLowerCase().includes(qText.trim().toLowerCase()) || (p.sku || "").toLowerCase().includes(qText.trim().toLowerCase())
        : true;
      const matchCat = categoryId === "all" ? true : p.categoryId === categoryId;
      const matchSeason = seasonId === "all" ? true : p.seasonId === seasonId;
      return matchText && matchCat && matchSeason;
    });
  }, [products, qText, categoryId, seasonId]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Input placeholder="ابحث باسم المنتج أو SKU…" value={qText} onChange={(e) => setQText(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <select className="h-10 rounded-2xl border border-zinc-200 px-3 text-sm" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="all">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="h-10 rounded-2xl border border-zinc-200 px-3 text-sm" value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
            <option value="all">كل المواسم</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-3 space-y-3">
              <div className="h-28 rounded-2xl bg-zinc-100 animate-pulse" />
              <div className="h-4 bg-zinc-100 rounded animate-pulse" />
              <div className="h-4 bg-zinc-100 rounded w-2/3 animate-pulse" />
              <div className="h-9 bg-zinc-100 rounded-2xl animate-pulse" />
            </CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => {
            const price = p.salePrice ?? p.price;
            return (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-3 space-y-2">
                  <div className="relative h-28 w-full">
                    <LightboxImage
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.name}
                      className="h-28"
                      sizes="(max-width: 768px) 50vw, 300px"
                    />
                  </div>
                  <div className="text-sm font-semibold line-clamp-2">{p.name}</div>
                  <div className="text-xs text-zinc-600">{formatEGP(price)}</div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      add({ productId: p.id, name: p.name, price, qty: 1, image: p.images?.[0] || null });
                      toast.success("تمت الإضافة للسلة");
                    }}
                  >
                    إضافة للسلة
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {!loading && filtered.length === 0 ? (
        <div className="text-center text-sm text-zinc-600 py-10">لا توجد نتائج.</div>
      ) : null}
    </div>
  );
}
