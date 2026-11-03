import { NextRequest, NextResponse } from "next/server";

/**
 * Temporary production safety boundary.
 *
 * The current application does not yet have a trusted server-side
 * Supabase Auth -> profile -> tenant-membership authorization flow.
 * Client-side React guards are not an authorization boundary: the page
 * and its serialized data can be delivered before hydration.
 *
 * Until that flow and live RLS verification are complete, deny every
 * application route at the edge. The public trial-request page remains
 * available. Static Next.js assets are excluded by the matcher below.
 *
 * Remove this temporary gate only in the same reviewed change that adds
 * server-verified authentication and per-route authorization.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/demo-request" || pathname.startsWith("/demo-request/")) {
    return NextResponse.next();
  }

  return new NextResponse(
    [
      "<!doctype html>",
      '<html lang="id">',
      "<head>",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      "<title>ROTARI — Akses Sementara Ditutup</title>",
      "</head>",
      '<body style="font-family:system-ui,sans-serif;max-width:640px;margin:12vh auto;padding:24px;color:#172033">',
      "<h1>Akses aplikasi sementara ditutup</h1>",
      "<p>ROTARI sedang menjalani penguatan keamanan autentikasi dan isolasi tenant.</p>",
      "<p>Akses operasional akan dibuka kembali setelah autentikasi server-side dan otorisasi database terverifikasi.</p>",
      "</body>",
      "</html>",
    ].join(""),
    {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, max-age=0",
        "retry-after": "3600",
        "x-robots-tag": "noindex, nofollow",
      },
    }
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
