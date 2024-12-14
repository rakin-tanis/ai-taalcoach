import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add pathname to headers for server components
  response.headers.set("x-url", request.nextUrl.pathname);

  /* console.log("Middleware Request:", {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers),
  });
 */
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
