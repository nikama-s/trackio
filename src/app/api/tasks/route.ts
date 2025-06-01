import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";

type StatusWithTasks = {
  id: string;
  name: string;
  color: string | null;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    deadline: Date | null;
    createdAt: Date;
    updatedAt: Date;
    taskTags: Array<{
      tag: {
        id: string;
        name: string;
        color: string | null;
      };
    }>;
  }>;
};

// GET /api/tasks - Get all tasks for the authenticated user
export async function GET() {
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

    const statuses = await prisma.status.findMany({
      where: { userId: payload.userId },
      include: {
        tasks: {
          include: {
            taskTags: {
              include: {
                tag: true
              }
            }
          }
        }
      }
    });

    const groupedTasks = statuses.map((status: StatusWithTasks) => ({
      id: status.id,
      name: status.name,
      color: status.color,
      tasks: status.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        tags: task.taskTags.map((taskTag) => ({
          id: taskTag.tag.id,
          name: taskTag.tag.name,
          color: taskTag.tag.color
        })),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }))
    }));

    return NextResponse.json(groupedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
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

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!statusId) {
      return NextResponse.json(
        { error: "Status ID is required" },
        { status: 400 }
      );
    }

    // Check if status exists and belongs to user
    const status = await prisma.status.findFirst({
      where: {
        id: statusId,
        userId: payload.userId
      }
    });

    if (!status) {
      return NextResponse.json({ error: "Status not found" }, { status: 400 });
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

    const task = await prisma.task.create({
      data: {
        title,
        description,
        statusId,
        deadline: deadline ? new Date(deadline) : null,
        userId: payload.userId,
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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
