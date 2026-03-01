export async function getPublicCounts(): Promise<{ products: number; categories: number; seasons: number }> {
  // بدون Admin SDK لتبسيط النشر على Vercel (يمكنك لاحقاً إضافة Admin SDK إن رغبت).
  // نعرض أرقام افتراضية حتى لا يحدث خطأ أثناء البناء.
  return { products: 0, categories: 0, seasons: 0 };
}
