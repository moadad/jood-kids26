"use client";

import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { CompanySettings } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function openUrl(url?: string | null) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function ContactPage() {
  const [data, setData] = React.useState<CompanySettings | null>(null);

  React.useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "settings", "company"));
      if (snap.exists()) setData({ id: snap.id, ...(snap.data() as any) });
    }
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-xl font-extrabold text-brand-900">بيانات الشركة</div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="text-sm font-bold text-zinc-800">مواقع التواصل</div>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="secondary" className="justify-between" onClick={() => openUrl(data?.instagram)}>
              انستجرام <span className="text-xs text-zinc-600">فتح</span>
            </Button>
            <Button variant="secondary" className="justify-between" onClick={() => openUrl(data?.facebook)}>
              فيسبوك <span className="text-xs text-zinc-600">فتح</span>
            </Button>
            <Button variant="secondary" className="justify-between" onClick={() => openUrl(data?.telegram)}>
              تيلجرام <span className="text-xs text-zinc-600">فتح</span>
            </Button>
          </div>
          <div className="text-xs text-zinc-500">يمكن للأدمن تعديل الروابط من لوحة الأدمن → بيانات الشركة.</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="text-sm font-bold text-zinc-800">المواقع الجغرافية</div>
          <div className="grid grid-cols-1 gap-2">
            <Button className="justify-between" onClick={() => openUrl(data?.factoryMapUrl)}>
              موقع المصنع <span className="text-xs opacity-80">Google Maps</span>
            </Button>
            <Button className="justify-between" onClick={() => openUrl(data?.shopMapUrl)}>
              موقع المحل <span className="text-xs opacity-80">Google Maps</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
