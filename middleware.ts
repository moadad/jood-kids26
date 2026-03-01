import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Hide Admin routes unless unlocked (basic obfuscation).
  // Real security is enforced by Firebase Auth + Firestore Rules.
  if (pathname.startsWith("/admin")) {
    const unlocked = req.cookies.get("admin_unlocked")?.value === "1";
    const code = searchParams.get("unlock");
    const serverCode = process.env.ADMIN_ENTRY_CODE; // set in Vercel (Server env)
    const okByCode = !!serverCode && code === serverCode;

    if (!unlocked && !okByCode) {
      const url = req.nextUrl.clone();
      url.pathname = "/not-found";
      url.search = "";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
