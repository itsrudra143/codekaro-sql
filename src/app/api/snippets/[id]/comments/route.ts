import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

interface RouteParams {
  params: { id: string }; // Now correctly corresponds to the folder name [id]
}

// GET /api/snippets/[id]/comments - Fetch comments for a snippet
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: snippetId } = params; // Keep using snippetId internally for clarity

  if (!snippetId) {
    return NextResponse.json(
      { error: "Snippet ID is required" },
      { status: 400 }
    );
  }

  try {
    const comments = await prisma.snippetComment.findMany({
      where: { snippetId },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error(`Error fetching comments for snippet ${snippetId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/snippets/[id]/comments - Add a comment to a snippet
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: snippetId } = params; // Keep using snippetId internally for clarity
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!snippetId) {
    return NextResponse.json(
      { error: "Snippet ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    const snippetExists = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { id: true },
    });
    if (!snippetExists) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    const userName =
      typeof sessionClaims?.fullName === "string"
        ? sessionClaims.fullName
        : "Anonymous";

    const newComment = await prisma.snippetComment.create({
      data: {
        content: content.trim(),
        snippetId,
        userId,
        userName,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(`Error adding comment to snippet ${snippetId}:`, error);
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
