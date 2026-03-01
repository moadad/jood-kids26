"use client";

import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function login() {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success("تم تسجيل الدخول");
      window.location.href = "/admin";
    } catch (e: any) {
      toast.error(e?.message || "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <div className="text-xl font-extrabold text-brand-900">تسجيل دخول الأدمن</div>
            <div className="text-sm text-zinc-600">مطلوب حساب Firebase Auth مع صلاحية admin claim</div>
          </div>
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" size="lg" onClick={login} disabled={loading}>
            {loading ? "جاري الدخول…" : "دخول"}
          </Button>
          <div className="text-xs text-zinc-500 leading-relaxed">
            بعد إنشاء مستخدم في Firebase Auth، امنحه claim <b>admin=true</b> عبر السكربت داخل <b>scripts/set-admin-claim.mjs</b>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
