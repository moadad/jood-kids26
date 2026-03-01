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


## Deploy for FREE on Firebase Hosting (Static)

1) Install Firebase CLI and login:

```bash
npm i -g firebase-tools
firebase login
```

2) Build & export (creates /out):

```bash
npm run build
```

3) Deploy:

```bash
firebase deploy
```

Or in one command:

```bash
npm run deploy:firebase
```


## Deploy to Vercel (Recommended)

1) Push the project to GitHub.
2) In Vercel: **New Project** → Import your repo.
3) Add Environment Variables (Project Settings → Environment Variables):
   - Copy all keys from `.env.example` and fill with your Firebase values.
   - Optional: `ADMIN_ENTRY_CODE` (server env) to open admin by URL: `/admin/login?unlock=YOUR_CODE`

4) Deploy.

### PWA
- PWA is enabled via `next-pwa`. In production it generates a service-worker.
- In development it is disabled automatically.

### Admin hiding (basic)
- Admin routes are hidden by default.
- To unlock from UI: click the site logo/title **7 times** → then open `/admin/login`.

> Note: Real security must be enforced by Firebase Auth + Firestore Rules.

