import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

interface RouteParams {
  params: { commentId: string };
}

// DELETE /api/comments/[commentId] - Delete a comment by its ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { commentId } = params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!commentId) {
    return NextResponse.json(
      { error: "Comment ID is required" },
      { status: 400 }
    );
  }

  try {
    // Find the comment to verify ownership
    const comment = await prisma.snippetComment.findUnique({
      where: { id: commentId },
      select: { userId: true }, // Only need userId for the check
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if the authenticated user owns the comment
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this comment" },
        { status: 403 }
      );
    }

    // Delete the comment
    await prisma.snippetComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
