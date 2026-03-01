import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Order } from "@/lib/types";

function statusLabel(s: Order["status"]) {
  return (
    {
      new: "جديد",
      confirmed: "مؤكد",
      shipped: "تم الشحن",
      cancelled: "ملغي",
    } as const
  )[s];
}

function paymentLabel(v?: string) {
  const map: Record<string, string> = {
    cash_branch: "نقداً من خلال أحد فروعنا / كاش",
    waybill: "بوليصة شحن",
    bank_transfer: "تحويلات بنكية",
    instapay: "إنستا باي",
    wallets: "محافظ إلكترونية (فودافون كاش / اتصالات كاش / أورنج كاش)",
  };
  return v ? map[v] || v : "";
}

export function exportOrdersToExcel(orders: Order[], filenamePrefix = "orders") {
  const rows = orders.map((o) => ({
    orderId: o.id,
    orderNumber: o.orderNumber || "",
    status: statusLabel(o.status),
    customerName: o.customerName,
    phone: o.phone,
    governorate: o.governorate || "",
    city: o.city || "",
    address: o.address || "",
    shippingCompany: o.shippingCompanyName || "",
    paymentMethod: paymentLabel(o.paymentMethod),
    total: o.total,
    items: (o.items || []).map((it) => `${it.name} x${it.qty}`).join(" | "),
    notes: o.notes || "",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "orders");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const stamp = new Date().toISOString().slice(0, 10);
  saveAs(new Blob([out], { type: "application/octet-stream" }), `${filenamePrefix}_${stamp}.xlsx`);
}
