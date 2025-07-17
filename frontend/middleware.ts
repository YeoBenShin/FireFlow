import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without auth
  if (
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/login") ||
    pathname.startsWith('/Fireflow.svg') ||
    pathname.startsWith("/_next")  // Next.js internals
  ) {
    return NextResponse.next();
  }

  // Validate session with backend
  const res = await fetch("http://localhost:5100/api", {
    headers: {
      cookie: request.headers.get("cookie") || "",
  },
  });

  if (res.status === 401) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}