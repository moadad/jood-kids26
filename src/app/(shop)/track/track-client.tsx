"use client";

import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, assertFirebaseReady } from "@/lib/firebase/client";
import { Order } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEGP } from "@/lib/utils";
import { toast } from "sonner";

const labels: Record<Order["status"], string> = {
  new: "جديد",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  cancelled: "ملغي",
};

function normalizeNumber(v: string) {
  return v.replace(/\s+/g, "").trim();
}

export default function TrackOrderClient({
  initialOrderNumber,
}: {
  initialOrderNumber?: string;
}) {
  const [orderNumber, setOrderNumber] = React.useState(initialOrderNumber || "");
  const [loading, setLoading] = React.useState(false);
  const [order, setOrder] = React.useState<Order | null>(null);

  async function search() {
    const n = normalizeNumber(orderNumber);
    if (!n) {
      toast.error("أدخل رقم الطلب");
      return;
    }

    setLoading(true);
    try {
      assertFirebaseReady();
      const snap = await getDoc(doc(db, "orderTracking", n));
      setOrder(
        snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as any) : null
      );
      if (!snap.exists()) toast.error("لم يتم العثور على طلب بهذا الرقم");
    } catch (e: any) {
      toast.error(e?.message || "تعذر البحث");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (initialOrderNumber) {
      // auto-run once if user came from WhatsApp link
      void (async () => {
        await new Promise((r) => setTimeout(r, 50));
        await search();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="text-lg font-extrabold text-brand-900">تتبع الطلب</div>
          <div className="text-sm text-zinc-600">
            أدخل رقم الطلب الذي ظهر لك بعد الإرسال أو داخل رسالة واتساب.
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="رقم الطلب"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              inputMode="numeric"
            />
            <Button onClick={search} disabled={loading}>
              {loading ? "..." : "بحث"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {order ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold">
                #{order.orderNumber || order.id.slice(0, 8)}
              </div>
              <span className="text-xs rounded-full border px-3 py-1">
                {labels[order.status]}
              </span>
            </div>
            <div className="text-sm text-zinc-700 space-y-1">
              <div>الاسم: {order.customerName}</div>
              <div>الهاتف: {order.phone}</div>
              <div>
                العنوان: {order.governorate} • {order.city} • {order.address}
              </div>
              <div>شركة الشحن: {order.shippingCompanyName || "—"}</div>
              <div>طريقة الدفع: {order.paymentMethod || "—"}</div>
              <div className="pt-2 font-extrabold">
                الإجمالي: {formatEGP(order.total)}
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100">
              <div className="text-xs text-zinc-500 mb-2">العناصر</div>
              <div className="space-y-1 text-sm">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>
                      • {it.name} × {it.qty}
                    </span>
                    <span className="text-zinc-600">
                      {formatEGP(it.price * it.qty)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
