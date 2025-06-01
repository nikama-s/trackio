import { GET, POST } from "../route";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { cookies } from "next/headers";
import {
  mockUser,
  createRequest,
  expectUnauthorized,
  expectBadRequest,
  expectDatabaseError,
  setupAuthMocks,
  mockUnauthorizedCookies
} from "@/test/utils/api-test-utils";

// Mock setup
jest.mock("@/lib/prisma", () => ({
  status: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock("@/lib/auth/tokens", () => ({
  verifyAccessToken: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Statuses API", () => {
  const mockStatuses = [
    {
      id: "status-1",
      name: "To Do",
      color: "#000000",
      userId: mockUser.userId,
      isDefault: true
    },
    {
      id: "status-2",
      name: "In Progress",
      color: "#0000FF",
      userId: mockUser.userId,
      isDefault: false
    }
  ];

  const validRequest = {
    name: "New Status",
    color: "#FF0000"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks(verifyAccessToken as jest.Mock, cookies as jest.Mock);
  });

  describe("GET /api/statuses", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await GET();
      await expectUnauthorized(response);
    });

    it("should return 401 if invalid access token", async () => {
      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await GET();
      await expectUnauthorized(response);
    });

    it("should return all statuses for the user", async () => {
      (prisma.status.findMany as jest.Mock).mockResolvedValue(mockStatuses);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockStatuses);
      expect(prisma.status.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.userId }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.status.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      await expectDatabaseError(response, "Failed to fetch statuses");
    });
  });

  describe("POST /api/statuses", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await POST(
        createRequest("/api/statuses", "POST", validRequest)
      );
      await expectUnauthorized(response);
    });

    it("should return 400 if name is missing", async () => {
      const response = await POST(
        createRequest("/api/statuses", "POST", { color: "#FF0000" })
      );
      await expectBadRequest(response, "Name is required");
    });

    it("should return 400 if status with same name exists", async () => {
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(mockStatuses[0]);

      const response = await POST(
        createRequest("/api/statuses", "POST", validRequest)
      );
      await expectBadRequest(response, "Status with this name already exists");
    });

    it("should create a new status successfully", async () => {
      const newStatus = {
        ...validRequest,
        id: "new-status-id",
        userId: mockUser.userId,
        isDefault: false
      };

      (prisma.status.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.status.create as jest.Mock).mockResolvedValue(newStatus);

      const response = await POST(
        createRequest("/api/statuses", "POST", validRequest)
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newStatus);
      expect(prisma.status.create).toHaveBeenCalledWith({
        data: {
          ...validRequest,
          userId: mockUser.userId,
          isDefault: false
        }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.status.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await POST(
        createRequest("/api/statuses", "POST", validRequest)
      );
      await expectDatabaseError(response, "Failed to create status");
    });
  });
});
