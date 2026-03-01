"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Layers, CalendarDays, ShoppingCart, LogOut, Truck, Settings } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { toast } from "sonner";

const nav = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "التصنيفات", icon: Layers },
  { href: "/admin/seasons", label: "المواسم", icon: CalendarDays },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/admin/shipping", label: "شركات الشحن", icon: Truck },
  { href: "/admin/settings", label: "بيانات الشركة", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="min-h-dvh bg-zinc-50">
        <div className="mx-auto max-w-5xl p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold text-brand-900">لوحة الأدمن</div>
              <div className="text-sm text-zinc-600">إدارة المنتجات والتصنيفات والمواسم والطلبات</div>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
              onClick={async () => {
                await signOut(auth);
                toast.success("تم تسجيل الخروج");
                window.location.href = "/admin/login";
              }}
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {nav.map((i) => {
              const active = pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href));
              const Icon = i.icon;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition",
                    active ? "border-brand-200 bg-brand-50 text-brand-900" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <Icon size={16} />
                  {i.label}
                </Link>
              );
            })}
          </div>

          {children}
        </div>
      </div>
    </AdminGuard>
  );
}
