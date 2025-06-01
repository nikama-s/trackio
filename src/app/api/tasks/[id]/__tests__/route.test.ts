import { GET, PUT, DELETE } from "../route";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { cookies } from "next/headers";
import {
  mockUser,
  createRequest,
  expectUnauthorized,
  expectNotFound,
  expectForbidden,
  expectDatabaseError,
  mockUnauthorizedCookies,
  setupAuthMocks
} from "@/test/utils/api-test-utils";

// Mock setup
jest.mock("@/lib/prisma", () => ({
  task: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  taskTag: {
    deleteMany: jest.fn()
  }
}));

jest.mock("@/lib/auth/tokens", () => ({
  verifyAccessToken: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Task ID API", () => {
  const mockTask = {
    id: "task-1",
    title: "Test Task",
    description: "Test Description",
    deadline: new Date("2025-06-01T15:02:31.888Z").toISOString(),
    createdAt: new Date("2025-06-01T15:02:31.888Z").toISOString(),
    updatedAt: new Date("2025-06-01T15:02:31.888Z").toISOString(),
    userId: mockUser.userId,
    statusId: "status-1",
    status: {
      id: "status-1",
      name: "To Do",
      color: "#000000"
    }
  };

  const updateRequest = {
    title: "Updated Task",
    description: "Updated Description",
    statusId: "status-2",
    deadline: new Date("2025-06-02T15:02:31.888Z").toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks(verifyAccessToken as jest.Mock, cookies as jest.Mock);
  });

  describe("GET /api/tasks/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectUnauthorized(response);
    });

    it("should return 401 if invalid access token", async () => {
      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectUnauthorized(response);
    });

    it("should return 404 if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET(new Request("http://localhost"), {
        params: { id: "non-existent" }
      });
      await expectNotFound(response, "Task not found");
    });

    it("should return 403 if task belongs to another user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        userId: "other-user-id"
      });

      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectForbidden(response);
    });

    it("should return task if found and belongs to user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTask);
    });

    it("should return 500 if database error", async () => {
      (prisma.task.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectDatabaseError(response, "Failed to fetch task");
    });
  });

  describe("PUT /api/tasks/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectUnauthorized(response);
    });

    it("should return 404 if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectNotFound(response, "Task not found");
    });

    it("should return 403 if task belongs to another user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        userId: "other-user-id"
      });

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectForbidden(response);
    });

    it("should update task if found and belongs to user", async () => {
      const updatedTask = {
        ...mockTask,
        ...updateRequest,
        updatedAt: new Date("2025-06-02T15:02:31.888Z").toISOString()
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: {
          title: updateRequest.title,
          description: updateRequest.description,
          statusId: updateRequest.statusId,
          deadline: new Date(updateRequest.deadline)
        },
        include: {
          status: true
        }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectDatabaseError(response, "Failed to update task");
    });
  });

  describe("DELETE /api/tasks/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectUnauthorized(response);
    });

    it("should return 404 if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectNotFound(response, "Task not found");
    });

    it("should return 403 if task belongs to another user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        userId: "other-user-id"
      });

      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectForbidden(response);
    });

    it("should delete task if found and belongs to user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.taskTag.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.task.delete as jest.Mock).mockResolvedValue(mockTask);

      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: "Task deleted successfully" });
      expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({
        where: { taskId: "task-1" }
      });
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: "task-1" }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.taskTag.deleteMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectDatabaseError(response, "Failed to delete task");
    });
  });
});
