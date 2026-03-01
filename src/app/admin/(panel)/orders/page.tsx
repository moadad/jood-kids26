"use client";

import React from "react";
import { collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Order } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEGP } from "@/lib/utils";
import { toast } from "sonner";

const statuses: Order["status"][] = ["new", "confirmed", "shipped", "cancelled"];
const labels: Record<Order["status"], string> = {
  new: "جديد",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  cancelled: "ملغي",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function refresh() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  }

  React.useEffect(() => { void refresh(); }, []);

  async function setStatus(id: string, status: Order["status"]) {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      toast.success("تم تحديث الحالة");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "تعذر التحديث");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="font-bold">الطلبات</div>
          <Badge>{orders.length}</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-zinc-600">جاري التحميل…</div>
          ) : orders.length === 0 ? (
            <div className="text-sm text-zinc-600 text-center py-10">لا توجد طلبات.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-3xl border border-zinc-200 bg-white p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-sm">#{o.id.slice(0, 6)} — {o.customerName}</div>
                    <span className="text-xs rounded-full border px-3 py-1">{labels[o.status]}</span>
                  </div>
                  <div className="text-xs text-zinc-600">الهاتف: {o.phone} • {o.governorate ? o.governorate : ""}{o.city ? ` • ${o.city}` : ""}</div>
                  {o.address ? <div className="text-xs text-zinc-600">العنوان / الدفع: {o.address}</div> : null}
                  {o.shippingCompanyName ? <div className="text-xs text-zinc-600">شركة الشحن: {o.shippingCompanyName}</div> : null}

                  <div className="text-sm">
                    <div className="text-xs text-zinc-600 mb-1">العناصر</div>
                    <div className="space-y-1">
                      {o.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>• {it.name} × {it.qty}</span>
                          <span className="text-zinc-600">{formatEGP(it.price * it.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <div className="font-extrabold">{formatEGP(o.total)}</div>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={o.status === s ? "primary" : "secondary"}
                          onClick={() => void setStatus(o.id, s)}
                        >
                          {labels[s]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {o.notes ? <div className="text-xs text-zinc-600">ملاحظات: {o.notes}</div> : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
