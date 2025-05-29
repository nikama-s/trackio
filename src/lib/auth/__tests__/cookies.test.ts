import { setAuthCookies } from "../cookies";
import { NextResponse } from "next/server";

describe("Auth Cookies", () => {
  const mockAccessToken = "mock-access-token";
  const mockRefreshToken = "mock-refresh-token";

  it("should set cookies with correct properties", () => {
    const response = NextResponse.json({ success: true });
    const result = setAuthCookies(response, mockAccessToken, mockRefreshToken);

    const accessTokenCookie = result.cookies.get("accessToken");
    const refreshTokenCookie = result.cookies.get("refreshToken");

    expect(accessTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();
    expect(accessTokenCookie?.value).toBe(mockAccessToken);
    expect(refreshTokenCookie?.value).toBe(mockRefreshToken);
    expect(accessTokenCookie?.httpOnly).toBe(true);
    expect(refreshTokenCookie?.httpOnly).toBe(true);
    expect(accessTokenCookie?.sameSite).toBe("strict");
    expect(refreshTokenCookie?.sameSite).toBe("strict");
    expect(accessTokenCookie?.maxAge).toBe(15 * 60); // 15 minutes
    expect(refreshTokenCookie?.maxAge).toBe(7 * 24 * 60 * 60); // 7 days
  });

  it("should preserve existing response data", () => {
    const originalData = { message: "test" };
    const response = NextResponse.json(originalData);
    const result = setAuthCookies(response, mockAccessToken, mockRefreshToken);

    expect(result).toBe(response);
    expect(result.cookies.get("accessToken")).toBeDefined();
    expect(result.cookies.get("refreshToken")).toBeDefined();
  });
});
