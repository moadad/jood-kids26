export type Category = {
  id: string;
  name: string;
  sort: number;
  createdAt: string;
};

export type Season = {
  id: string;
  name: string;
  sort: number;
  createdAt: string;
};

export type ShippingCompany = {
  id: string;
  name: string;
  phone?: string;
  sort: number;
  active: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  sku?: string;
  modelNumber?: number | null;
  modelGroup?: string | null;
  price: number;
  salePrice?: number | null;
  categoryId: string;
  seasonId: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock?: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
};

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  governorate?: string;
  city?: string;
  address?: string;
  shippingCompanyId?: string;
  shippingCompanyName?: string;
  paymentMethod?: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: "new" | "confirmed" | "shipped" | "cancelled";
  createdAt: string;
};


export type CompanySettings = {
  id: string;
  instagram?: string | null;
  facebook?: string | null;
  telegram?: string | null;
  factoryMapUrl?: string | null;
  shopMapUrl?: string | null;
  updatedAt?: string;
};

export type PolicySettings = {
  id: string;
  returnWindowDays: number; // default 7
  manufacturingDefectDays: number; // default 10
  noticeBeforeReturnDays: number; // default 3
  policyHtml?: string | null; // optional rich text (safe, admin-controlled)
  updatedAt?: string;
};
