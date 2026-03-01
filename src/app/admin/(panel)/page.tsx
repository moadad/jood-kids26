"use client";

import React from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({ products: 0, activeProducts: 0, ordersNew: 0 });

  React.useEffect(() => {
    async function load() {
      const [pAll, pActive, oNew] = await Promise.all([
        getCountFromServer(collection(db, "products")),
        getCountFromServer(query(collection(db, "products"), where("active", "==", true))),
        getCountFromServer(query(collection(db, "orders"), where("status", "==", "new"))),
      ]);
      setStats({ products: pAll.data().count, activeProducts: pActive.data().count, ordersNew: oNew.data().count });
    }
    void load();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card><CardContent className="p-5">
        <div className="text-sm text-zinc-600">كل المنتجات</div>
        <div className="text-3xl font-extrabold">{stats.products}</div>
      </CardContent></Card>
      <Card><CardContent className="p-5">
        <div className="text-sm text-zinc-600">المنتجات النشطة</div>
        <div className="text-3xl font-extrabold">{stats.activeProducts}</div>
      </CardContent></Card>
      <Card><CardContent className="p-5">
        <div className="text-sm text-zinc-600">طلبات جديدة</div>
        <div className="text-3xl font-extrabold">{stats.ordersNew}</div>
      </CardContent></Card>
    </div>
  );
}
