import { NextRequest, NextResponse } from "next/server";
import { auth0, configured } from "./lib/auth0";
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedRoute = path === "/profile" || path.startsWith("/profile/") || path === "/calendar" || path.startsWith("/calendar/") || path.startsWith("/api/");
  const noStore = { "Cache-Control": "no-store" };
  if (!configured()) {
    if (protectedRoute || path.startsWith("/auth/")) return NextResponse.json(
      { error: "Sign-in is not configured yet. Please try again later." }, { status: 503, headers: noStore });
    return NextResponse.next();
  }
  try {
    const response = await auth0().middleware(request);
    if (!protectedRoute) return response;
    response.headers.set("Cache-Control", "no-store");
    if ((await auth0().getSession(request))?.user?.sub) return response;
    if (path.startsWith("/api/")) return NextResponse.json({ error: "Please sign in" }, { status: 401, headers: noStore });
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("returnTo", path + request.nextUrl.search);
    return NextResponse.redirect(login, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503, headers: noStore });
  }
}
export const config = { matcher: ["/((?!_next/static|_next/image|icon.svg|apple-icon.png|manifest.webmanifest|sw.js|offline.html).*)"] };
