import { POST } from "../route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken
} from "@/lib/auth/tokens";
import { setAuthCookies } from "@/lib/auth/cookies";

// Mock setup
jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn()
  }
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn()
}));

jest.mock("@/lib/auth/tokens", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  saveRefreshToken: jest.fn()
}));

jest.mock("@/lib/auth/cookies", () => ({
  setAuthCookies: jest.fn()
}));

describe("Login Endpoint", () => {
  // Test data
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    password: "hashed-password"
  };

  const validRequest = {
    email: "test@example.com",
    password: "Password123"
  };

  // Helper functions
  const createRequest = (body: typeof validRequest) =>
    new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

  const mockSuccessfulLogin = () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (generateAccessToken as jest.Mock).mockReturnValue("mock-access-token");
    (generateRefreshToken as jest.Mock).mockReturnValue("mock-refresh-token");
    (saveRefreshToken as jest.Mock).mockResolvedValue(undefined);
    (setAuthCookies as jest.Mock).mockImplementation((response) => response);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSuccessfulLogin();
  });

  it("should login user successfully", async () => {
    const response = await POST(createRequest(validRequest));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual({
      email: mockUser.email,
      id: mockUser.id
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      validRequest.password,
      mockUser.password
    );
    expect(generateAccessToken).toHaveBeenCalledWith(
      mockUser.id,
      mockUser.email
    );
    expect(generateRefreshToken).toHaveBeenCalledWith(mockUser.id);
    expect(saveRefreshToken).toHaveBeenCalledWith(
      mockUser.id,
      "mock-refresh-token"
    );
    expect(setAuthCookies).toHaveBeenCalled();
  });

  it("should return 401 for invalid credentials", async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await POST(createRequest(validRequest));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid email or password");
  });

  it("should return 401 when user not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await POST(createRequest(validRequest));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid email or password");
  });

  it("should return 400 for invalid request body", async () => {
    const response = await POST(
      createRequest({
        email: "invalid-email",
        password: "short"
      })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toBeDefined();
  });

  it("should return 500 for server errors", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await POST(createRequest(validRequest));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
