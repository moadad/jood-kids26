import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEGP(value: number) {
  return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(value);
}

export function daysUntil(dateISO: string) {
  const due = new Date(dateISO);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


export function computeModelGroup(modelNumber?: number | null) {
  if (modelNumber === null || modelNumber === undefined || Number.isNaN(Number(modelNumber))) return null;
  const n = Math.trunc(Number(modelNumber));
  const s = String(Math.abs(n));
  // قاعدة التصنيف:
  // - أقل من 1000: المجموعة = الرقم بالكامل
  // - من 1000 إلى 9999: المجموعة = أول رقم
  // - 10000 فأكثر: المجموعة = أول رقمين
  if (s.length <= 3) return s;
  if (s.length === 4) return s.slice(0, 1);
  return s.slice(0, 2);
}
