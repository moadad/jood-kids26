import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderItem } from "@/lib/types";

type State = {
  items: OrderItem[];
  add: (item: OrderItem) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return { items: s.items.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i)) };
          }
          return { items: [...s.items, item] };
        }),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) => set((s) => ({ items: s.items.map((i) => (i.productId === productId ? { ...i, qty } : i)) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: "joodkids-cart-v1" }
  )
);
