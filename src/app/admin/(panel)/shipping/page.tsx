"use client";

import React from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { ShippingCompany } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function nowISO() {
  return new Date().toISOString();
}

export default function AdminShippingPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<ShippingCompany[]>([]);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [sort, setSort] = React.useState<number>(1);
  const [active, setActive] = React.useState(true);
  const [editing, setEditing] = React.useState<ShippingCompany | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function refresh() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "shippingCompanies"), orderBy("sort", "asc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  }

  React.useEffect(() => { void refresh(); }, []);

  function reset() {
    setName("");
    setPhone("");
    setSort(items.length + 1);
    setActive(true);
    setEditing(null);
  }

  async function save() {
    if (!name.trim()) return toast.error("اكتب اسم شركة الشحن");
    setBusy(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim() || null,
        sort: Number(sort || 1),
        active: Boolean(active),
        createdAt: editing?.createdAt || nowISO(),
      };
      if (editing) {
        await updateDoc(doc(db, "shippingCompanies", editing.id), payload);
        toast.success("تم التحديث");
      } else {
        await addDoc(collection(db, "shippingCompanies"), payload);
        toast.success("تمت الإضافة");
      }
      reset();
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "تعذر الحفظ");
    } finally {
      setBusy(false);
    }
  }

  async function remove(it: ShippingCompany) {
    if (!confirm("تأكيد الحذف؟")) return;
    try {
      await deleteDoc(doc(db, "shippingCompanies", it.id));
      toast.success("تم الحذف");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "تعذر الحذف");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="font-bold">شركات الشحن</div>
          <Badge>{items.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-4 gap-2">
            <Input placeholder="اسم الشركة" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="رقم هاتف (اختياري)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="ترتيب" inputMode="numeric" value={String(sort)} onChange={(e) => setSort(Number(e.target.value || 1))} />
            <label className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm flex items-center justify-between bg-white">
              <span>مفعّلة</span>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={busy}>{busy ? "جاري الحفظ…" : editing ? "تحديث" : "إضافة"}</Button>
            <Button variant="secondary" onClick={reset}>تفريغ</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="text-sm text-zinc-600">جاري التحميل…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-zinc-600 text-center py-10">لا توجد شركات شحن.</div>
          ) : (
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="rounded-3xl border border-zinc-200 bg-white p-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-bold">{it.name} {!it.active ? <span className="text-xs text-zinc-500">(موقوفة)</span> : null}</div>
                    <div className="text-xs text-zinc-600">{it.phone ? `هاتف: ${it.phone}` : "بدون رقم"} • ترتيب: {it.sort}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(it);
                        setName(it.name);
                        setPhone(it.phone || "");
                        setSort(it.sort || 1);
                        setActive(Boolean(it.active));
                      }}
                    >
                      تعديل
                    </Button>
                    <Button variant="danger" onClick={() => remove(it)}>حذف</Button>
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
