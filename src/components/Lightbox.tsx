"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
};

export function LightboxImage({ src, alt, className, imageClassName, sizes }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("relative block w-full overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50", className)}
        aria-label="تكبير الصورة"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || "(max-width: 768px) 100vw, 400px"}
          className={cn("object-contain", imageClassName)}
          priority={false}
        />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white overflow-hidden shadow-soft border border-zinc-100">
              <div className="flex items-center justify-between p-3 border-b border-zinc-100">
                <div className="text-sm font-bold text-zinc-800 line-clamp-1">{alt}</div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-2xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center"
                  aria-label="إغلاق"
                >
                  ✕
                </button>
              </div>
              <div className="relative aspect-square bg-black/5">
                <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" />
              </div>
              <div className="p-3 text-xs text-zinc-600">اضغط خارج الصورة للإغلاق.</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
