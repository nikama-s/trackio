import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  saveRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens
} from "../tokens";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import "@testing-library/jest-dom";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  refreshToken: {
    create: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn()
  }
}));

describe("Token Utilities", () => {
  const mockUserId = "test-user-id";
  const mockEmail = "test@example.com";
  const mockToken = "mock-token";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateAccessToken", () => {
    it("should generate a valid access token", () => {
      const token = generateAccessToken(mockUserId, mockEmail);
      expect(token).toBeDefined();

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as jwt.JwtPayload;
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockEmail);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      const token = generateRefreshToken(mockUserId);
      expect(token).toBeDefined();

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as jwt.JwtPayload;
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token", () => {
      const token = generateAccessToken(mockUserId, mockEmail);
      const payload = verifyAccessToken(token);

      expect(payload.userId).toBe(mockUserId);
      expect(payload.email).toBe(mockEmail);
    });

    it("should throw error for invalid token", () => {
      expect(() => verifyAccessToken("invalid-token")).toThrow();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token", async () => {
      const token = generateRefreshToken(mockUserId);

      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
        token,
        userId: mockUserId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const payload = await verifyRefreshToken(token);
      expect(payload.userId).toBe(mockUserId);
    });

    it("should throw error for invalid token", async () => {
      await expect(verifyRefreshToken("invalid-token")).rejects.toThrow();
    });

    it("should throw error for expired token", async () => {
      const token = generateRefreshToken(mockUserId);

      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(verifyRefreshToken(token)).rejects.toThrow(
        "Invalid or expired refresh token"
      );
    });
  });

  describe("saveRefreshToken", () => {
    it("should save refresh token to database", async () => {
      const token = generateRefreshToken(mockUserId);
      await saveRefreshToken(mockUserId, token);

      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          token,
          userId: mockUserId,
          expiresAt: expect.any(Date)
        })
      });
    });
  });

  describe("deleteRefreshToken", () => {
    it("should delete refresh token from database", async () => {
      await deleteRefreshToken(mockToken);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: mockToken }
      });
    });
  });

  describe("deleteAllUserRefreshTokens", () => {
    it("should delete all refresh tokens for a user", async () => {
      await deleteAllUserRefreshTokens(mockUserId);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      });
    });
  });
});
