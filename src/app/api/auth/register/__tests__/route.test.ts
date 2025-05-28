import { POST } from "../route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken
} from "@/lib/auth/tokens";

jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn()
}));

jest.mock("@/lib/auth/tokens", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  saveRefreshToken: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Register Endpoint", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    password: "hashed-password"
  };

  const validRequest = {
    email: "test@example.com",
    password: "Password123",
    confirmPassword: "Password123"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (generateAccessToken as jest.Mock).mockReturnValue("mock-access-token");
    (generateRefreshToken as jest.Mock).mockReturnValue("mock-refresh-token");
    (saveRefreshToken as jest.Mock).mockResolvedValue(undefined);
  });

  it("should register a new user successfully", async () => {
    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequest)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user).toEqual({
      email: mockUser.email,
      id: mockUser.id
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(validRequest.password, 10);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: validRequest.email,
        password: "hashed-password"
      }
    });

    expect(generateAccessToken).toHaveBeenCalledWith(
      mockUser.id,
      mockUser.email
    );
    expect(generateRefreshToken).toHaveBeenCalledWith(mockUser.id);
    expect(saveRefreshToken).toHaveBeenCalledWith(
      mockUser.id,
      "mock-refresh-token"
    );
  });

  it("should return 400 if email is already in use", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequest)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email already in use");
  });

  it("should return 400 for invalid request body", async () => {
    const invalidRequest = {
      email: "invalid-email",
      password: "short",
      confirmPassword: "different"
    };

    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidRequest)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toBeDefined();
  });

  it("should return 500 for server errors", async () => {
    (prisma.user.create as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequest)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
