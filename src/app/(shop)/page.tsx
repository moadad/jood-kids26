import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { getPublicCounts } from "@/lib/server/publicStats";

export default async function HomePage() {
  const stats = await getPublicCounts();
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-brand-900">JoodKids</h1>
            <p className="text-sm text-zinc-600">متجر جملة للأطفال — تصفح المنتجات واطلب بسرعة عبر واتساب.</p>
          </div>
          <div className="mt-4 flex gap-3">
            <Link href="/products" className="rounded-2xl bg-brand-700 px-4 py-2 text-white font-medium">تصفح المنتجات</Link>
            <Link href="/admin" className="rounded-2xl bg-zinc-100 px-4 py-2 text-zinc-900 font-medium">لوحة الأدمن</Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-100">
              <div className="text-lg font-bold">{stats.products}</div>
              <div className="text-xs text-zinc-600">منتج</div>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-100">
              <div className="text-lg font-bold">{stats.categories}</div>
              <div className="text-xs text-zinc-600">تصنيف</div>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-100">
              <div className="text-lg font-bold">{stats.seasons}</div>
              <div className="text-xs text-zinc-600">موسم</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Section title="سريع ومناسب للجملة" description="سلة مشتريات + إرسال طلب واتساب منظم.">
        <div className="grid grid-cols-2 gap-3">
          <Card><CardContent className="p-4 text-sm text-zinc-700">فلترة حسب الموسم والتصنيف</CardContent></Card>
          <Card><CardContent className="p-4 text-sm text-zinc-700">رفع صور Cloudinary بدون Storage</CardContent></Card>
          <Card><CardContent className="p-4 text-sm text-zinc-700">لوحة أدمن + استيراد/تصدير Excel</CardContent></Card>
          <Card><CardContent className="p-4 text-sm text-zinc-700">إدارة طلبات وحالات الشحن</CardContent></Card>
        </div>
      </Section>
    </div>
  );
}
