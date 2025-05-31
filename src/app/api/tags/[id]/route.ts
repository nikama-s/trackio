import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";

// GET /api/tags/[id] - Get a specific tag
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const tag = await prisma.tag.findFirst({
      where: {
        id: params.id,
        userId: payload.userId
      }
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error fetching tag:", error);
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 });
  }
}

// PATCH /api/tags/[id] - Update a tag
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const tag = await prisma.tag.findFirst({
      where: {
        id: params.id,
        userId: payload.userId
      }
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, color } = body;

    if (name && tag.isDefault) {
      return NextResponse.json(
        { error: "Cannot modify name of default tag" },
        { status: 400 }
      );
    }

    if (name) {
      // Check if tag with same name already exists for this user
      const existingTag = await prisma.tag.findFirst({
        where: {
          userId: payload.userId,
          name,
          id: { not: params.id }
        }
      });

      if (existingTag) {
        return NextResponse.json(
          { error: "Tag with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name,
        color
      }
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Delete a tag
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const tag = await prisma.tag.findFirst({
      where: {
        id: params.id,
        userId: payload.userId
      }
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    if (tag.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default tag" },
        { status: 400 }
      );
    }

    // Delete all TaskTag relations first
    await prisma.taskTag.deleteMany({
      where: { tagId: params.id }
    });

    // Then delete the tag
    await prisma.tag.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: "Tag deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
