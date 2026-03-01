"use client";

import React from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Item = { id: string; name: string; sort: number; createdAt: string };

function nowISO() { return new Date().toISOString(); }

export default function Page() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [name, setName] = React.useState("");
  const [sort, setSort] = React.useState<number>(1);
  const [editing, setEditing] = React.useState<Item | null>(null);

  async function refresh() {
    const snap = await getDocs(query(collection(db, "seasons"), orderBy("sort","asc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }

  React.useEffect(() => { void refresh(); }, []);

  async function save() {
    if (!name.trim()) return toast.error("الاسم مطلوب");
    const payload = { name: name.trim(), sort: Number(sort || 1), createdAt: editing?.createdAt || nowISO() };
    try {
      if (editing) {
        await updateDoc(doc(db, "seasons", editing.id), payload as any);
        toast.success("تم التحديث");
      } else {
        await addDoc(collection(db, "seasons"), payload as any);
        toast.success("تمت الإضافة");
      }
      setEditing(null); setName(""); setSort(1);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "تعذر الحفظ");
    }
  }

  async function remove(it: Item) {
    if (!confirm("تأكيد الحذف؟")) return;
    try {
      await deleteDoc(doc(db, "seasons", it.id));
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
          <div className="font-bold">المواسم</div>
          <Badge>{items.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="الترتيب" type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void save()}>{editing ? "حفظ التعديل" : "إضافة"}</Button>
            {editing ? <Button variant="secondary" onClick={() => { setEditing(null); setName(""); setSort(1); }}>إلغاء</Button> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3">
                <div>
                  <div className="font-semibold text-sm">{it.name}</div>
                  <div className="text-xs text-zinc-600">ترتيب: {it.sort}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setEditing(it); setName(it.name); setSort(it.sort); }}>تعديل</Button>
                  <Button variant="danger" size="sm" onClick={() => void remove(it)}>حذف</Button>
                </div>
              </div>
            ))}
            {items.length === 0 ? <div className="text-sm text-zinc-600 text-center py-8">لا يوجد بيانات.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
