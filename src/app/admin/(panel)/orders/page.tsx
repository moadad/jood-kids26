"use client";

import React from "react";
import { collection, doc, getDocs, limit, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Order, ShippingCompany } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEGP } from "@/lib/utils";
import { toast } from "sonner";
import { exportOrdersToExcel } from "@/lib/excel/orders";

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
  const [shippingCompanies, setShippingCompanies] = React.useState<ShippingCompany[]>([]);

  // Filters
  const [qText, setQText] = React.useState("");
  const [status, setStatusFilter] = React.useState<"" | Order["status"]>("");
  const [payment, setPayment] = React.useState("");
  const [shipId, setShipId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  async function refresh() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(2000)));
    setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  }

  React.useEffect(() => {
    async function loadShipping() {
      try {
        const snap = await getDocs(query(collection(db, "shippingCompanies"), orderBy("sort", "asc")));
        setShippingCompanies(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch {
        // ignore
      }
    }
    void loadShipping();
  }, []);

  React.useEffect(() => { void refresh(); }, []);

  async function setStatus(id: string, status: Order["status"]) {
    try {
      await updateDoc(doc(db, "orders", id), { status, updatedAt: new Date().toISOString() });

      // تحديث مستند التتبع العام إذا كان متاحاً
      const current = orders.find((o) => o.id === id);
      if (current?.orderNumber) {
        await setDoc(
          doc(db, "orderTracking", current.orderNumber),
          { status, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      }

      toast.success("تم تحديث الحالة");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "تعذر التحديث");
    }
  }

  const filtered = React.useMemo(() => {
    const t = qText.trim().toLowerCase();
    const fromD = from ? new Date(from + "T00:00:00") : null;
    const toD = to ? new Date(to + "T23:59:59") : null;

    return orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (payment && (o.paymentMethod || "") !== payment) return false;
      if (shipId && (o.shippingCompanyId || "") !== shipId) return false;

      const d = o.createdAt ? new Date(o.createdAt) : null;
      if (fromD && d && d < fromD) return false;
      if (toD && d && d > toD) return false;

      if (t) {
        const hay = [
          o.id,
          o.orderNumber || "",
          o.customerName || "",
          o.phone || "",
          o.governorate || "",
          o.city || "",
          o.shippingCompanyName || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [orders, qText, status, payment, shipId, from, to]);

  function clearFilters() {
    setQText("");
    setStatusFilter("");
    setPayment("");
    setShipId("");
    setFrom("");
    setTo("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="font-bold">الطلبات</div>
          <Badge>{filtered.length}</Badge>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2">
            <Input
              placeholder="بحث: رقم الطلب / الاسم / الهاتف"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <select className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm bg-white" value={status} onChange={(e) => setStatusFilter(e.target.value as any)}>
                <option value="">كل الحالات</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{labels[s]}</option>
                ))}
              </select>
              <select className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm bg-white" value={payment} onChange={(e) => setPayment(e.target.value)}>
                <option value="">كل طرق الدفع</option>
                <option value="cash_branch">نقداً من خلال أحد فروعنا / كاش</option>
                <option value="waybill">بوليصة شحن</option>
                <option value="bank_transfer">تحويلات بنكية</option>
                <option value="instapay">إنستا باي</option>
                <option value="wallets">محافظ إلكترونية</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm bg-white" value={shipId} onChange={(e) => setShipId(e.target.value)}>
                <option value="">كل شركات الشحن</option>
                {shippingCompanies.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <input className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={clearFilters}>مسح الفلاتر</Button>
              <Button variant="secondary" onClick={() => exportOrdersToExcel(filtered, "orders_filtered")}>تصدير Excel (المعروض)</Button>
              <Button variant="secondary" onClick={() => exportOrdersToExcel(orders, "orders_all")}>تصدير Excel (الكل)</Button>
              <Button onClick={() => void refresh()}>تحديث</Button>
            </div>
            <div className="text-xs text-zinc-500">ملاحظة: يتم تحميل آخر 2000 طلب ثم تطبيق الفلاتر محلياً (بدون إعداد Index في Firestore).</div>
          </div>

          {loading ? (
            <div className="text-sm text-zinc-600">جاري التحميل…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-zinc-600 text-center py-10">لا توجد طلبات.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((o) => (
                <div key={o.id} className="rounded-3xl border border-zinc-200 bg-white p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-sm">#{o.orderNumber || o.id.slice(0, 8)} — {o.customerName}</div>
                    <span className="text-xs rounded-full border px-3 py-1">{labels[o.status]}</span>
                  </div>
                  <div className="text-xs text-zinc-600">الهاتف: {o.phone} • {o.governorate ? o.governorate : ""}{o.city ? ` • ${o.city}` : ""}</div>
                  {o.address ? <div className="text-xs text-zinc-600">العنوان: {o.address}</div> : null}
                  {o.shippingCompanyName ? <div className="text-xs text-zinc-600">شركة الشحن: {o.shippingCompanyName}</div> : null}
                  {o.paymentMethod ? <div className="text-xs text-zinc-600">طريقة الدفع: {o.paymentMethod}</div> : null}

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
