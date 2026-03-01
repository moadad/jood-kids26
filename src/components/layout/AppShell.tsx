"use client";
import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Home, LayoutGrid, Shield, Menu, X, CalendarDays, Layers, Info, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/products", label: "المنتجات", icon: LayoutGrid },
  { href: "/cart", label: "السلة", icon: ShoppingBag },
  { href: "/admin", label: "الأدمن", icon: Shield },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();
  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="mx-auto max-w-md min-h-dvh bg-white shadow-soft">
        <div className="p-4 border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur z-20">
          <div className="flex items-center justify-between">
            <button
              aria-label="القائمة"
              className="h-10 w-10 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div className="font-extrabold text-brand-800 tracking-tight">JoodKids</div>

            <Link href="/products" className="h-10 px-3 rounded-2xl bg-brand-50 text-sm text-brand-800 flex items-center hover:bg-brand-100">
              تسوق الآن
            </Link>
          </div>

          {menuOpen ? (
            <div className="fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/35" onClick={() => setMenuOpen(false)} />
              <div className="absolute top-0 right-0 left-0 mx-auto max-w-md">
                <div className="m-3 rounded-3xl bg-white shadow-soft border border-zinc-100 overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="font-bold text-brand-900">القائمة</div>
                    <button className="h-9 w-9 rounded-2xl bg-zinc-100 flex items-center justify-center" onClick={() => setMenuOpen(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-2 grid gap-2">
                    <Link onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3 hover:bg-zinc-50" href="/products">
                      <span className="flex items-center gap-2"><LayoutGrid size={18} /> المنتجات</span>
                      <span className="text-xs text-zinc-500">عرض الكل</span>
                    </Link>
                    <Link onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3 hover:bg-zinc-50" href="/admin">
                      <span className="flex items-center gap-2"><Shield size={18} /> لوحة الأدمن</span>
                      <span className="text-xs text-zinc-500">تسجيل/إدارة</span>
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link onClick={() => setMenuOpen(false)} className="rounded-2xl bg-teal-50 border border-teal-100 p-3 flex items-center gap-2 hover:bg-teal-100" href="/products">
                        <CalendarDays size={18} /> المواسم
                      </Link>
                      <Link onClick={() => setMenuOpen(false)} className="rounded-2xl bg-brand-50 border border-brand-100 p-3 flex items-center gap-2 hover:bg-brand-100" href="/products">
                        <Layers size={18} /> التصنيفات
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link onClick={() => setMenuOpen(false)} className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3 flex items-center gap-2 hover:bg-zinc-100" href="/contact">
                        <Info size={18} /> بيانات الشركة
                      </Link>
                      <Link onClick={() => setMenuOpen(false)} className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3 flex items-center gap-2 hover:bg-zinc-100" href="/policy">
                        <FileText size={18} /> السياسات
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

        </div>

        <main className="p-4 pb-24">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0">
          <div className="mx-auto max-w-md bg-white border-t border-zinc-100">
            <div className="grid grid-cols-4">
              {nav.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "py-3 flex flex-col items-center gap-1 text-xs",
                      active ? "text-brand-800" : "text-zinc-500"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
