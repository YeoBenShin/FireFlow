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
  try {
    const token = request.cookies.get("token")?.value;
    // console.log("Token from cookie:", token);

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const res = await fetch("https://fireflow-m0z1.onrender.com/api", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();

  } catch (error) {
    console.error("Error validating session:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
}