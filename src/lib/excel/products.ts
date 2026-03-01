import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Product } from "@/lib/types";

export function exportProductsToExcel(products: Product[]) {
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku || "",
    modelNumber: p.modelNumber ?? "",
    modelGroup: p.modelGroup ?? "",
    price: p.price,
    salePrice: p.salePrice ?? "",
    categoryId: p.categoryId,
    seasonId: p.seasonId,
    images: (p.images || []).join(" | "),
    sizes: (p.sizes || []).join(" | "),
    colors: (p.colors || []).join(" | "),
    stock: p.stock ?? "",
    active: p.active ? 1 : 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "products");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([out], { type: "application/octet-stream" }), `products_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export async function importProductsFromExcel(file: File): Promise<Partial<Product>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]!]!;
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

  return json.map((r) => ({
    id: String(r.id || "").trim(),
    name: String(r.name || "").trim(),
    sku: String(r.sku || "").trim() || undefined,
    modelNumber: r.modelNumber === "" ? null : Number(r.modelNumber),
    modelGroup: String(r.modelGroup || "").trim() || undefined,
    price: Number(r.price || 0),
    salePrice: r.salePrice === "" ? null : Number(r.salePrice),
    categoryId: String(r.categoryId || "").trim(),
    seasonId: String(r.seasonId || "").trim(),
    images: String(r.images || "")
      .split("|")
      .map((s: string) => s.trim())
      .filter(Boolean),
    sizes: String(r.sizes || "")
      .split("|")
      .map((s: string) => s.trim())
      .filter(Boolean),
    colors: String(r.colors || "")
      .split("|")
      .map((s: string) => s.trim())
      .filter(Boolean),
    stock: r.stock === "" ? null : Number(r.stock),
    active: String(r.active || "1").trim() === "1",
  }));
}
