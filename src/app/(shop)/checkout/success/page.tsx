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

const buttonLinkClass = (variant: "primary" | "secondary" | "ghost" | "danger" = "primary") => {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    ghost: "hover:bg-zinc-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return base + " " + (variants[variant] || variants.primary);
};


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
          <div className="text-xs text-zinc-500">
            رقم الطلب: {order?.orderNumber ? `#${order.orderNumber}` : orderId ? `#${orderId.slice(0, 8)}` : "—"}
          </div>
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
              <div>طريقة الدفع: {order.paymentMethod || "—"}</div>
              <div className="pt-2 font-bold">الإجمالي: {formatEGP(order.total)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link href="\1" className={buttonLinkClass("secondary") + " w-full"}>\2</Link>
        <Button asChild className="w-full">
          <Link href={order?.orderNumber ? `/track?o=${order.orderNumber}` : "/track"}>تتبع الطلب</Link>
        </Button>
      </div>
    </div>
  );
}