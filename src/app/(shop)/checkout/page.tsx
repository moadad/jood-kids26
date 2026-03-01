"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart";
import { formatEGP } from "@/lib/utils";
import { ShippingCompany } from "@/lib/types";
import { toast } from "sonner";

function buildWhatsAppMessage(orderId: string, name: string, phone: string, gov: string, city: string, address: string, shipName: string, payment: string, items: any[], total: number) {
  const lines = [
    `طلب جديد - JoodKids`,
    `رقم الطلب: ${orderId}`,
    `الاسم: ${name}`,
    `الهاتف: ${phone}`,
    `المحافظة: ${gov}`,
    `المدينة: ${city}`,
    `العنوان: ${address}`,
    `شركة الشحن: ${shipName}`,
    `طريقة الدفع: ${payment}`,
    `---------------------`,
    ...items.map((i: any) => `• ${i.name} × ${i.qty} = ${formatEGP(i.price * i.qty)}`),
    `---------------------`,
    `الإجمالي: ${formatEGP(total)}`,
  ];
  return encodeURIComponent(lines.join("\n"));
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.total)();

  const [name, setName] = React.useState("");
  const [governorate, setGovernorate] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [shippingCompanyId, setShippingCompanyId] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [shippingCompanies, setShippingCompanies] = React.useState<ShippingCompany[]>([]);

  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

React.useEffect(() => {
  async function loadShipping() {
    try {
      const snap = await getDocs(
        query(collection(db, "shippingCompanies"), where("active", "==", true), orderBy("sort", "asc"))
      );
      setShippingCompanies(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch {
      // ignore
    }
  }
  void loadShipping();
}, []);


  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  async function submit() {
    if (!name.trim() || !phone.trim()) {
      toast.error("الاسم ورقم الهاتف مطلوبان");
      return;
    }

if (!governorate.trim() || !city.trim() || !address.trim()) {
  toast.error("يرجى إدخال المحافظة والمدينة والعنوان");
  return;
}
if (!shippingCompanyId) {
  toast.error("يرجى اختيار شركة الشحن");
  return;
}
if (!paymentMethod) {
  toast.error("يرجى اختيار طريقة الدفع");
  return;
}

    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        customerName: name.trim(),
        phone: phone.trim(),
        governorate: governorate.trim(),
        city: city.trim(),
        address: address.trim(),
        shippingCompanyId,
        shippingCompanyName: shippingCompanies.find((s) => s.id === shippingCompanyId)?.name || null,
        paymentMethod,
        notes: notes.trim() || null,
        items,
        total,
        status: "new",
        createdAt: new Date().toISOString(),
        createdAtServer: serverTimestamp(),
      });

      toast.success("تم إنشاء الطلب");
      // فتح واتساب
      if (whatsappNumber) {
        const shipName = shippingCompanies.find((s) => s.id === shippingCompanyId)?.name || "";
        const msg = buildWhatsAppMessage(docRef.id, name.trim(), phone.trim(), governorate.trim(), city.trim(), address.trim(), shipName, paymentMethod, items, total);
        const url = `https://wa.me/${whatsappNumber}?text=${msg}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }
      clear();
      router.push(`/checkout/success?order=${docRef.id}`);
    } catch (e: any) {
      toast.error(e?.message || "تعذر إنشاء الطلب");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="text-lg font-bold">بيانات العميل</div>
          <Input placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <select className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm bg-white" value={governorate} onChange={(e) => setGovernorate(e.target.value)}>
            <option value="">اختر المحافظة</option>
            {["القاهرة","الجيزة","الإسكندرية","الدقهلية","الشرقية","الغربية","المنوفية","القليوبية","البحيرة","كفر الشيخ","دمياط","بورسعيد","الإسماعيلية","السويس","شمال سيناء","جنوب سيناء","الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","البحر الأحمر","الوادي الجديد","مطروح"].map((g)=> (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <Input placeholder="المدينة" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input placeholder="العنوان بالتفصيل" value={address} onChange={(e) => setAddress(e.target.value)} />
          <select className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm bg-white" value={shippingCompanyId} onChange={(e) => setShippingCompanyId(e.target.value)}>
            <option value="">اختر شركة الشحن</option>
            {shippingCompanies.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm bg-white" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">اختر طريقة الدفع</option>
            <option value="cash">الكاش (عند الاستلام / بالفرع)</option>
            <option value="waybill">بوليصة شحن</option>
            <option value="bank">تحويل بنكي</option>
            <option value="instapay">إنستا باي</option>
            <option value="wallets">محافظ إلكترونية (فودافون/اتصالات/أورنج)</option>
          </select>
          <Input placeholder="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </CardContent>
      </Card>

      <div className="text-xs text-zinc-600">
        بإتمام الطلب أنت توافق على <a className="underline" href="/policy">سياسة الدفع والاسترجاع</a>.
      </div>

      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <div className="text-sm text-zinc-600">الإجمالي</div>
          <div className="text-lg font-bold">{formatEGP(total)}</div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={submit} disabled={saving}>
        {saving ? "جاري الإرسال…" : "إتمام الطلب وإرساله عبر واتساب"}
      </Button>

      {!whatsappNumber ? (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3">
          ملاحظة: لم يتم ضبط رقم واتساب. أضف المتغير <b>NEXT_PUBLIC_WHATSAPP_NUMBER</b> داخل <b>.env.local</b>.
        </div>
      ) : null}
    </div>
  );
}
