import { POST } from "../route";
import prisma from "@/lib/prisma";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  deleteRefreshToken
} from "@/lib/auth/tokens";
import { setAuthCookies } from "@/lib/auth/cookies";
import { cookies } from "next/headers";

jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn()
  }
}));

jest.mock("@/lib/auth/tokens", () => ({
  verifyRefreshToken: jest.fn(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  saveRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn()
}));

jest.mock("@/lib/auth/cookies", () => ({
  setAuthCookies: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Refresh Endpoint", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com"
  };

  const mockCookieStore = {
    get: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
    (verifyRefreshToken as jest.Mock).mockResolvedValue({
      userId: mockUser.id
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (generateAccessToken as jest.Mock).mockReturnValue("new-access-token");
    (generateRefreshToken as jest.Mock).mockReturnValue("new-refresh-token");
    (saveRefreshToken as jest.Mock).mockResolvedValue(undefined);
    (deleteRefreshToken as jest.Mock).mockResolvedValue(undefined);
    (setAuthCookies as jest.Mock).mockImplementation((response) => response);
  });

  it("should refresh tokens successfully", async () => {
    const mockRefreshToken = "old-refresh-token";
    mockCookieStore.get.mockReturnValue({ value: mockRefreshToken });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual({
      email: mockUser.email,
      id: mockUser.id
    });

    expect(verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
    expect(deleteRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
    expect(generateAccessToken).toHaveBeenCalledWith(
      mockUser.id,
      mockUser.email
    );
    expect(generateRefreshToken).toHaveBeenCalledWith(mockUser.id);
    expect(saveRefreshToken).toHaveBeenCalledWith(
      mockUser.id,
      "new-refresh-token"
    );
    expect(setAuthCookies).toHaveBeenCalled();
  });

  it("should return 401 when refresh token is missing", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Refresh token not found");
  });

  it("should return 401 when refresh token is invalid", async () => {
    const mockRefreshToken = "invalid-token";
    mockCookieStore.get.mockReturnValue({ value: mockRefreshToken });
    (verifyRefreshToken as jest.Mock).mockRejectedValue(
      new Error("Invalid token")
    );

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid or expired refresh token");
  });

  it("should return 404 when user not found", async () => {
    const mockRefreshToken = "valid-token";
    mockCookieStore.get.mockReturnValue({ value: mockRefreshToken });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should return 401 for server errors", async () => {
    const mockRefreshToken = "valid-token";
    mockCookieStore.get.mockReturnValue({ value: mockRefreshToken });
    (verifyRefreshToken as jest.Mock).mockRejectedValue(
      new Error("Token verification failed")
    );

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid or expired refresh token");
  });
});
