"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Order } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatEGP } from "@/lib/utils";

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();
  const orderId = sp.get("order") || "";
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      if (!orderId) return;
      setLoading(true);
      const snap = await getDoc(doc(db, "orders", orderId));
      setOrder(snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as any) : null);
      setLoading(false);
    }
    void load();
  }, [orderId]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 text-center space-y-2">
          <div className="text-2xl font-bold text-brand-800">تم استلام بيانات الطلب ✅</div>
          <div className="text-sm text-zinc-600">تم فتح واتساب لإرسال الطلب، ويمكنك الرجوع للمتجر الآن.</div>
          <div className="text-xs text-zinc-500">رقم الطلب: {orderId ? `#${orderId.slice(0, 8)}` : "—"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-2">
          <div className="font-bold">ملخص</div>
          {loading ? (
            <div className="text-sm text-zinc-600">جاري التحميل…</div>
          ) : !order ? (
            <div className="text-sm text-zinc-600">تعذر تحميل تفاصيل الطلب.</div>
          ) : (
            <div className="text-sm text-zinc-700 space-y-1">
              <div>الاسم: {order.customerName}</div>
              <div>الهاتف: {order.phone}</div>
              <div>العنوان: {order.governorate} • {order.city} • {order.address}</div>
              <div>شركة الشحن: {order.shippingCompanyName || "—"}</div>
              <div className="pt-2 font-bold">الإجمالي: {formatEGP(order.total)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="secondary" className="w-full">
          <Link href="/products">متابعة التسوق</Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}
