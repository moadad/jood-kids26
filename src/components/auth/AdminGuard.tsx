"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getIdTokenResult } from "firebase/auth";
import { useAuth } from "./AuthProvider";
import { Card, CardContent } from "@/components/ui/card";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ok, setOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let alive = true;

    async function check() {
      if (!user) {
        setOk(false);
        return;
      }
      const token = await getIdTokenResult(user, true);
      const isAdmin = Boolean(token.claims.admin);
      if (!alive) return;
      setOk(isAdmin);
      if (!isAdmin) router.replace("/admin/login");
    }

    if (!loading) void check();
    return () => {
      alive = false;
    };
  }, [user, loading, router]);

  if (loading || ok === null) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-zinc-600">جاري التحقق من صلاحيات الأدمن…</CardContent>
      </Card>
    );
  }

  if (!ok) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-zinc-600">يجب تسجيل الدخول كأدمن.</CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
