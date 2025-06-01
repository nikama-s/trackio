import { PUT, DELETE } from "../route";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { cookies } from "next/headers";
import {
  mockUser,
  createRequest,
  expectUnauthorized,
  expectNotFound,
  expectForbidden,
  expectBadRequest,
  expectDatabaseError,
  setupAuthMocks,
  mockUnauthorizedCookies
} from "@/test/utils/api-test-utils";

// Mock setup
jest.mock("@/lib/prisma", () => ({
  status: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  task: {
    findFirst: jest.fn(),
    updateMany: jest.fn()
  }
}));

jest.mock("@/lib/auth/tokens", () => ({
  verifyAccessToken: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Status API", () => {
  const mockStatus = {
    id: "status-1",
    name: "To Do",
    color: "#000000",
    userId: mockUser.userId,
    isDefault: true
  };

  const nonDefaultStatus = {
    ...mockStatus,
    isDefault: false
  };

  const validUpdateRequest = {
    name: "Updated Status",
    color: "#FF0000"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks(verifyAccessToken as jest.Mock, cookies as jest.Mock);
  });

  describe("PUT /api/statuses/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await PUT(
        createRequest("/api/statuses/status-1", "PUT", validUpdateRequest),
        { params: { id: "status-1" } }
      );
      await expectUnauthorized(response);
    });

    it("should return 404 if status not found", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(null);
      const response = await PUT(
        createRequest("/api/statuses/status-1", "PUT", validUpdateRequest),
        { params: { id: "status-1" } }
      );
      await expectNotFound(response, "Status not found");
    });

    it("should return 403 if user doesn't own the status", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue({
        ...mockStatus,
        userId: "different-user-id"
      });
      const response = await PUT(
        createRequest("/api/statuses/status-1", "PUT", validUpdateRequest),
        { params: { id: "status-1" } }
      );
      await expectForbidden(response);
    });

    it("should return 400 if trying to modify default status name", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(mockStatus);
      const response = await PUT(
        createRequest("/api/statuses/status-1", "PUT", { name: "New Name" }),
        { params: { id: "status-1" } }
      );
      await expectBadRequest(response, "Cannot modify name of default status");
    });

    it("should return 400 if status with same name exists", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(
        nonDefaultStatus
      );
      (prisma.status.findFirst as jest.Mock).mockResolvedValue({
        ...mockStatus,
        id: "different-id"
      });

      const response = await PUT(
        createRequest("/api/statuses/status-1", "PUT", {
          name: "Existing Name"
        }),
        { params: { id: "status-1" } }
      );
      await expectBadRequest(response, "Status with this name already exists");
    });

    it("should update status successfully", async () => {
      const updatedStatus = { ...nonDefaultStatus, ...validUpdateRequest };
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(
        nonDefaultStatus
      );
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.status.update as jest.Mock).mockResolvedValue(updatedStatus);

      const response = await PUT(
        createRequest("/api/statuses/status-1", "PUT", validUpdateRequest),
        { params: { id: "status-1" } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedStatus);
      expect(prisma.status.update).toHaveBeenCalledWith({
        where: { id: "status-1" },
        data: validUpdateRequest
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(
        nonDefaultStatus
      );
      (prisma.status.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await PUT(
        createRequest("/api/statuses/status-1", "PUT", validUpdateRequest),
        { params: { id: "status-1" } }
      );
      await expectDatabaseError(response, "Failed to update status");
    });
  });

  describe("DELETE /api/statuses/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await DELETE(
        createRequest("/api/statuses/status-1", "DELETE"),
        { params: { id: "status-1" } }
      );
      await expectUnauthorized(response);
    });

    it("should return 404 if status not found", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(null);
      const response = await DELETE(
        createRequest("/api/statuses/status-1", "DELETE"),
        { params: { id: "status-1" } }
      );
      await expectNotFound(response, "Status not found");
    });

    it("should return 403 if user doesn't own the status", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue({
        ...mockStatus,
        userId: "different-user-id"
      });
      const response = await DELETE(
        createRequest("/api/statuses/status-1", "DELETE"),
        { params: { id: "status-1" } }
      );
      await expectForbidden(response);
    });

    it("should return 400 if trying to delete default status", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(mockStatus);
      const response = await DELETE(
        createRequest("/api/statuses/status-1", "DELETE"),
        { params: { id: "status-1" } }
      );
      await expectBadRequest(response, "Cannot delete default status");
    });

    it("should delete status and reassign tasks successfully", async () => {
      const toDoStatus = { id: "to-do-status", name: "To Do" };
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(
        nonDefaultStatus
      );
      (prisma.task.findFirst as jest.Mock).mockResolvedValue({ id: "task-1" });
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(toDoStatus);

      const response = await DELETE(
        createRequest("/api/statuses/status-1", "DELETE"),
        { params: { id: "status-1" } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe(
        "Status deleted successfully and tasks reassigned to 'To Do'"
      );
      expect(prisma.task.updateMany).toHaveBeenCalledWith({
        where: { statusId: "status-1" },
        data: { statusId: "to-do-status" }
      });
      expect(prisma.status.delete).toHaveBeenCalledWith({
        where: { id: "status-1" }
      });
    });

    it("should delete status without tasks successfully", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(
        nonDefaultStatus
      );
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await DELETE(
        createRequest("/api/statuses/status-1", "DELETE"),
        { params: { id: "status-1" } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Status deleted successfully");
      expect(prisma.status.delete).toHaveBeenCalledWith({
        where: { id: "status-1" }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.status.findUnique as jest.Mock).mockResolvedValue(
        nonDefaultStatus
      );
      (prisma.status.delete as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await DELETE(
        createRequest("/api/statuses/status-1", "DELETE"),
        { params: { id: "status-1" } }
      );
      await expectDatabaseError(response, "Failed to delete status");
    });
  });
});
