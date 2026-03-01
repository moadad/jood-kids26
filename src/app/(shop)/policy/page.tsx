"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { PolicySettings } from "@/lib/types";

const DEFAULT_POLICY = {
  returnWindowDays: 7,
  manufacturingDefectDays: 10,
  noticeBeforeReturnDays: 3,
};

export default function PolicyPage() {
  const [p, setP] = React.useState<PolicySettings | null>(null);

  React.useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "settings", "policies"));
      if (snap.exists()) setP({ id: snap.id, ...(snap.data() as any) });
      else setP({ id: "policies", ...DEFAULT_POLICY } as any);
    }
    void load();
  }, []);

  const returnDays = p?.returnWindowDays ?? DEFAULT_POLICY.returnWindowDays;
  const defectDays = p?.manufacturingDefectDays ?? DEFAULT_POLICY.manufacturingDefectDays;
  const noticeDays = p?.noticeBeforeReturnDays ?? DEFAULT_POLICY.noticeBeforeReturnDays;

  return (
    <div className="space-y-4">
      <div className="text-xl font-extrabold text-brand-900">سياسة الدفع والاسترجاع</div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="text-sm font-bold text-zinc-800">طرق الدفع</div>
          <ol className="list-decimal pr-5 space-y-2 text-sm text-zinc-700">
            <li>نقداً من خلال أحد فروعنا</li>
            <li>تحويلات بنكية</li>
            <li>إنستا باي</li>
            <li>محافظ إلكترونية (فودافون كاش أو اتصالات كاش أو أورنج كاش)</li>
            <li>نعتذر من عملائنا الكرام البيع بالآجل لأي سبب كان</li>
          </ol>
          <div className="text-xs text-zinc-500">قد تختلف الإتاحة حسب الفرع / المنطقة.</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="text-sm font-bold text-zinc-800">سياسة الاسترجاع والاستبدال</div>
          <div className="text-sm text-zinc-700 leading-7">
            يمكنك عمل طلب استرجاع أو استبدال للمنتجات خلال <b>{returnDays} أيام</b>.
            وفي حالات عيوب الصناعة خلال <b>{defectDays} أيام</b> من وقت وصول الطلب.
          </div>

          <div className="text-sm text-zinc-700 leading-7">
            عند إرجاع المنتج، تأكد من وجود جميع الملحقات الخاصة بالطلب بحالتها السليمة، وأن المنتج في عبوته الأصلية
            وبتغليفه الأصلي، والملابس بحالتها كما وصلت للعميل غير مستعملة أو ملبوسة أو مغسولة.
          </div>

          <div className="text-sm text-zinc-700 leading-7">
            الاستبدال والاسترجاع على الملابس الخارجية فقط والتي بدون خصم.
          </div>

          <div className="text-sm text-zinc-700 leading-7">
            <b>تنويه:</b> عند رجوع البضاعة بدون تبليغنا قبل الاسترجاع بـ <b>{noticeDays} أيام</b> على الأقل سوف يتم خصم قيمة الشحن ذهاباً وإياباً من العربون المدفوع لدينا.
          </div>

          <div className="text-sm text-zinc-700 leading-7">
            لديك <b>{returnDays} أيام</b> من تاريخ استلامك أي سلعة لتقدم طلب إرجاعها.
          </div>
        </CardContent>
      </Card>

      {p?.policyHtml ? (
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="text-sm font-bold text-zinc-800">ملاحظات إضافية</div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: p.policyHtml }} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
