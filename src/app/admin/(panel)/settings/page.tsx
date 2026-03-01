"use client";

import React from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = React.useState(true);

  const [instagram, setInstagram] = React.useState("");
  const [facebook, setFacebook] = React.useState("");
  const [telegram, setTelegram] = React.useState("");
  const [factoryMapUrl, setFactoryMapUrl] = React.useState("");
  const [shopMapUrl, setShopMapUrl] = React.useState("");

  const [returnWindowDays, setReturnWindowDays] = React.useState(7);
  const [manufacturingDefectDays, setManufacturingDefectDays] = React.useState(10);
  const [noticeBeforeReturnDays, setNoticeBeforeReturnDays] = React.useState(3);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const [c, p] = await Promise.all([getDoc(doc(db, "settings", "company")), getDoc(doc(db, "settings", "policies"))]);
      if (c.exists()) {
        const d: any = c.data();
        setInstagram(d.instagram || "");
        setFacebook(d.facebook || "");
        setTelegram(d.telegram || "");
        setFactoryMapUrl(d.factoryMapUrl || "");
        setShopMapUrl(d.shopMapUrl || "");
      }
      if (p.exists()) {
        const d: any = p.data();
        setReturnWindowDays(Number(d.returnWindowDays || 7));
        setManufacturingDefectDays(Number(d.manufacturingDefectDays || 10));
        setNoticeBeforeReturnDays(Number(d.noticeBeforeReturnDays || 3));
      }
      setLoading(false);
    }
    void load();
  }, []);

  async function save() {
    try {
      await Promise.all([
        setDoc(
          doc(db, "settings", "company"),
          { instagram: instagram.trim() || null, facebook: facebook.trim() || null, telegram: telegram.trim() || null, factoryMapUrl: factoryMapUrl.trim() || null, shopMapUrl: shopMapUrl.trim() || null, updatedAt: new Date().toISOString(), updatedAtServer: serverTimestamp() },
          { merge: true }
        ),
        setDoc(
          doc(db, "settings", "policies"),
          { returnWindowDays, manufacturingDefectDays, noticeBeforeReturnDays, updatedAt: new Date().toISOString(), updatedAtServer: serverTimestamp() },
          { merge: true }
        ),
      ]);
      toast.success("تم حفظ الإعدادات");
    } catch (e: any) {
      toast.error(e?.message || "تعذر الحفظ");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="text-lg font-bold">بيانات الشركة</div>
          <Input placeholder="رابط انستجرام" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          <Input placeholder="رابط فيسبوك" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          <Input placeholder="رابط تيلجرام" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
          <Input placeholder="رابط موقع المصنع (Google Maps)" value={factoryMapUrl} onChange={(e) => setFactoryMapUrl(e.target.value)} />
          <Input placeholder="رابط موقع المحل (Google Maps)" value={shopMapUrl} onChange={(e) => setShopMapUrl(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="text-lg font-bold">سياسات الاسترجاع</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input type="number" placeholder="7" value={returnWindowDays} onChange={(e) => setReturnWindowDays(Number(e.target.value || 7))} />
            <Input type="number" placeholder="10" value={manufacturingDefectDays} onChange={(e) => setManufacturingDefectDays(Number(e.target.value || 10))} />
            <Input type="number" placeholder="3" value={noticeBeforeReturnDays} onChange={(e) => setNoticeBeforeReturnDays(Number(e.target.value || 3))} />
          </div>
          <div className="text-xs text-zinc-600">الترتيب: (أيام الاسترجاع) / (عيوب الصناعة) / (إبلاغ قبل الاسترجاع).</div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={save} disabled={loading}>
        {loading ? "جاري التحميل…" : "حفظ"}
      </Button>
    </div>
  );
}
