import { POST } from "../route";
import { deleteRefreshToken } from "@/lib/auth/tokens";
import { cookies } from "next/headers";

jest.mock("@/lib/auth/tokens", () => ({
  deleteRefreshToken: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Logout Endpoint", () => {
  const mockCookieStore = {
    get: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
  });

  it("should logout user successfully with refresh token", async () => {
    const mockRefreshToken = "mock-refresh-token";
    mockCookieStore.get.mockReturnValue({ value: mockRefreshToken });
    (deleteRefreshToken as jest.Mock).mockResolvedValue(undefined);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Logged out successfully");
    expect(deleteRefreshToken).toHaveBeenCalledWith(mockRefreshToken);

    const accessTokenCookie = response.cookies.get("accessToken");
    const refreshTokenCookie = response.cookies.get("refreshToken");
    expect(accessTokenCookie?.value).toBe("");
    expect(refreshTokenCookie?.value).toBe("");
    expect(accessTokenCookie?.expires).toBeDefined();
    expect(refreshTokenCookie?.expires).toBeDefined();
  });

  it("should logout user successfully without refresh token", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Logged out successfully");
    expect(deleteRefreshToken).not.toHaveBeenCalled();

    const accessTokenCookie = response.cookies.get("accessToken");
    const refreshTokenCookie = response.cookies.get("refreshToken");
    expect(accessTokenCookie?.value).toBe("");
    expect(refreshTokenCookie?.value).toBe("");
    expect(accessTokenCookie?.expires).toBeDefined();
    expect(refreshTokenCookie?.expires).toBeDefined();
  });

  it("should handle token deletion error gracefully", async () => {
    const mockRefreshToken = "mock-refresh-token";
    mockCookieStore.get.mockReturnValue({ value: mockRefreshToken });
    (deleteRefreshToken as jest.Mock).mockRejectedValue(
      new Error("Token deletion failed")
    );

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Logged out successfully");

    const accessTokenCookie = response.cookies.get("accessToken");
    const refreshTokenCookie = response.cookies.get("refreshToken");
    expect(accessTokenCookie?.value).toBe("");
    expect(refreshTokenCookie?.value).toBe("");
    expect(accessTokenCookie?.expires).toBeDefined();
    expect(refreshTokenCookie?.expires).toBeDefined();
  });

  it("should return 500 for server errors", async () => {
    mockCookieStore.get.mockImplementation(() => {
      throw new Error("Cookie error");
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Logout failed");
  });
});
