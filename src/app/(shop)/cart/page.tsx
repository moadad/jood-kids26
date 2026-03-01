"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEGP } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { LightboxImage } from "@/components/Lightbox";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const total = useCartStore((s) => s.total)();

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-zinc-600 space-y-3">
            <div>السلة فارغة.</div>
            <Link href="/products" className="underline">اذهب للمنتجات</Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((i) => (
              <Card key={i.productId}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-20 shrink-0">
                      {i.image ? (
                        <LightboxImage src={i.image} alt={i.name} className="h-20 w-20" sizes="80px" />
                      ) : (
                        <div className="h-20 w-20 rounded-2xl bg-zinc-100" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">{i.name}</div>
                      <div className="text-xs text-zinc-600">{formatEGP(i.price)}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-600">الكمية</span>
                        <Input
                          className="w-20 text-center"
                          type="number"
                          min={1}
                          value={i.qty}
                          onChange={(e) => setQty(i.productId, Math.max(1, Number(e.target.value || 1)))}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => remove(i.productId)}>حذف</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-sm text-zinc-600">الإجمالي</div>
              <div className="text-lg font-bold">{formatEGP(total)}</div>
            </CardContent>
          </Card>

          <Link href="/checkout">
            <Button className="w-full" size="lg">إتمام الطلب</Button>
          </Link>
        </>
      )}
    </div>
  );
}
