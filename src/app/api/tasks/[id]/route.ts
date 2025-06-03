import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";

// GET /api/tasks/[id] - Get a specific task
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request, context: any) {
  const { params } = context;
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: id },
      include: {
        status: true,
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.userId !== payload.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Transform the response to include tags in a more convenient format
    const transformedTask = {
      ...task,
      tags: task.taskTags.map((taskTag) => ({
        id: taskTag.tag.id,
        name: taskTag.tag.name,
        color: taskTag.tag.color
      }))
    };

    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: Request, context: any) {
  const { params } = context;
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { title, description, statusId, deadline, tagIds } = body;

    const existingTask = await prisma.task.findUnique({
      where: { id: id }
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== payload.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // If statusId is provided, verify it exists and belongs to user
    if (statusId) {
      const status = await prisma.status.findFirst({
        where: {
          id: statusId,
          userId: payload.userId
        }
      });

      if (!status) {
        return NextResponse.json(
          { error: "Status not found" },
          { status: 400 }
        );
      }
    }

    // If tagIds are provided, verify they all exist and belong to user
    if (tagIds?.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId: payload.userId
        }
      });

      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          { error: "One or more tags not found" },
          { status: 400 }
        );
      }
    }

    // Delete existing task tags
    await prisma.taskTag.deleteMany({
      where: { taskId: id }
    });

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: {
        title: title ?? existingTask.title,
        description: description ?? existingTask.description,
        statusId: statusId ?? existingTask.statusId,
        deadline: deadline ? new Date(deadline) : existingTask.deadline,
        taskTags: {
          create:
            tagIds?.map((tagId: string) => ({
              tag: {
                connect: {
                  id: tagId
                }
              }
            })) || []
        }
      },
      include: {
        status: true,
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: any) {
  const { params } = context;
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: id }
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== payload.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete all TaskTag relations first
    await prisma.taskTag.deleteMany({
      where: { taskId: id }
    });

    // Then delete the task
    await prisma.task.delete({
      where: { id: id }
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
