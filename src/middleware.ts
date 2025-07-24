// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   const token = await getToken({ req: request });
//   const isPublicPath = request.nextUrl.pathname === "/login";

//   // If the user is not authenticated and trying to access a protected route
//   if (!token && !isPublicPath) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // If the user is authenticated and trying to access login page
//   if (token && isPublicPath) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// // Configure which routes to run middleware on
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder
//      */
//     "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
//   ],
// };


// TEMPORARY MIDDLEWARE
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isPublicPath = request.nextUrl.pathname === "/" || 
                      request.nextUrl.pathname.startsWith("/api/early-access");

  // Allow public paths without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check auth for all other routes
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If they're logged in but trying to access login page, redirect to dashboard
  if (request.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
