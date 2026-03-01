# JoodKids — Ultimate (Next.js + Firebase + Cloudinary)

متجر جملة للأطفال + لوحة أدمن احترافية:
- منتجات + تصنيفات + مواسم
- طلبات عبر واتساب
- رفع صور عبر Cloudinary Unsigned (بدون Firebase Storage)
- استيراد/تصدير Excel للمنتجات
- حماية الأدمن عبر Firebase Auth + Custom Claim admin=true

## 1) التشغيل محلياً
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2) Firebase Setup
1) أنشئ مشروع Firebase
2) فعّل Firestore
3) فعّل Authentication > Email/Password
4) أنشئ Web App وخذ مفاتيحها وضعها في `.env.local`
5) ضع قواعد Firestore من ملف `firestore.rules` داخل Firebase Console

## 3) جعل حساب أدمن (Admin Claim)
1) أنشئ مستخدم أدمن من Firebase Auth (Email/Password)
2) نزّل Service Account Key:
   Firebase Console > Project Settings > Service accounts > Generate new private key
3) احفظ الملف كالتالي:
   `scripts/serviceAccountKey.json`
4) نفّذ:
```bash
npm run set-admin -- admin@example.com
```
5) سجّل خروج/دخول في لوحة الأدمن لتحديث التوكن.

## 4) Cloudinary Unsigned Upload
- أنشئ Upload Preset باسم (Unsigned) واجعله Unsigned.
- ضع CLOUD_NAME و UPLOAD_PRESET في `.env.local`

## 5) النشر على Vercel
1) ارفع المشروع على GitHub
2) في Vercel: New Project > Import
3) أضف نفس متغيرات البيئة الموجودة في `.env.local`
4) Deploy ✅

## المسارات
- المتجر:
  - `/` الرئيسية
  - `/products` المنتجات
  - `/cart` السلة
  - `/checkout` إنهاء الطلب + واتساب
- الأدمن:
  - `/admin/login` تسجيل الدخول
  - `/admin` لوحة التحكم
  - `/admin/products` المنتجات + Excel + رفع صور
  - `/admin/categories` التصنيفات
  - `/admin/seasons` المواسم
  - `/admin/orders` إدارة الطلبات

> ملاحظة: لوحة الأدمن تتطلب Claim: admin=true على المستخدم.


## صفحات إضافية
- /contact بيانات الشركة وروابط السوشيال + خرائط.
- /policy سياسة الدفع والاسترجاع.
