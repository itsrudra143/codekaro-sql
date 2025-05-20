import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

interface RouteParams {
  params: { id: string };
}

// GET /api/snippets/[id] - Fetch a single snippet by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      // Optionally include related data if needed on the detail page
      // include: { user: { select: { name: true, userId: true } } }
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json(snippet);
  } catch (error) {
    console.error(`Error fetching snippet ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch snippet" },
      { status: 500 }
    );
  }
}

// DELETE /api/snippets/[id] - Delete a snippet by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First, find the snippet to ensure it exists and check ownership
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      select: { userId: true }, // Only select userId for check
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    // Check if the authenticated user is the owner of the snippet
    if (snippet.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this snippet" },
        { status: 403 }
      );
    }

    // Delete associated comments and stars first (if not handled by cascade delete)
    // Prisma schema already has onDelete: Cascade for comments and stars linked to snippets,
    // so Prisma should handle this automatically.
    // If cascade delete wasn't set, you would need manual deletes:
    // await prisma.snippetComment.deleteMany({ where: { snippetId: id } });
    // await prisma.star.deleteMany({ where: { snippetId: id } });

    // Delete the snippet itself
    await prisma.snippet.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Snippet deleted successfully" },
      { status: 200 } // Or 204 No Content
    );
  } catch (error) {
    console.error(`Error deleting snippet ${id}:`, error);
    // Handle specific Prisma errors if needed (e.g., P2025 Record not found)
    return NextResponse.json(
      { error: "Failed to delete snippet" },
      { status: 500 }
    );
  }
}

// TODO: Add PUT/PATCH handler for updating snippets if needed
