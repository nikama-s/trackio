import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyAccessTokenEdge,
  verifyRefreshTokenEdge
} from "@/lib/auth/edgeTokens";
import api from "@/lib/api/axiosInstance";

const publicRoutes = ["/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.includes(route))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return redirectToLogin(request);
  }

  if (accessToken) {
    try {
      await verifyAccessTokenEdge(accessToken);
      return NextResponse.next();
    } catch {
      console.log("Access token invalid, will be refreshing");
    }
  }

  if (refreshToken) {
    try {
      await verifyRefreshTokenEdge(refreshToken);

      const baseUrl = request.nextUrl.origin;
      const response = await api.post(`${baseUrl}/api/auth/refresh`, null, {
        headers: {
          Cookie: `refreshToken=${refreshToken}`
        }
      });

      const newResponse = NextResponse.next();
      const cookies = response.headers["set-cookie"];
      if (cookies) {
        cookies.forEach((cookie) => {
          newResponse.headers.append("Set-Cookie", cookie);
        });
      }

      const newAccessToken = response.headers["set-cookie"]
        ?.find((cookie) => cookie.startsWith("accessToken="))
        ?.split(";")[0]
        .split("=")[1];

      if (!newAccessToken) {
        throw new Error("No new access token received");
      }

      await verifyAccessTokenEdge(newAccessToken);
      return newResponse;
    } catch {
      return redirectToLogin(request);
    }
  }

  return redirectToLogin(request);
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";
  if (
    !url.pathname.includes("/auth/") &&
    !request.nextUrl.pathname.includes("/auth/")
  ) {
    url.searchParams.set("from", request.nextUrl.pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match all paths except:
    // - /api/* (handled by axios instance)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)"
  ]
};
