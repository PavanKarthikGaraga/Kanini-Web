import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/admin"];
const authRoutes = ["/auth/login", "/auth/signup"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isAuthenticated = request.cookies.get("kairo_session")?.value === "true";

    // Redirect unauthenticated users away from protected routes
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
    if (isProtected && !isAuthenticated) {
        const loginUrl = new URL("/auth/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    if (isAuthRoute && isAuthenticated) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/:path*", "/admin/:path*"],
};
