import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

interface RouteParams {
  params: { id: string }; // Now correctly corresponds to the folder name [id]
}

// GET /api/snippets/[id]/stars - Get star count and user's star status
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: snippetId } = params; // Keep using snippetId internally for clarity
  const { userId } = await auth();

  if (!snippetId) {
    return NextResponse.json(
      { error: "Snippet ID is required" },
      { status: 400 }
    );
  }

  try {
    const countPromise = prisma.star.count({
      where: { snippetId },
    });

    const userStarPromise = userId
      ? prisma.star.findUnique({
          where: {
            userId_snippetId: { userId, snippetId },
          },
          select: { id: true },
        })
      : Promise.resolve(null);

    const [count, userStar] = await Promise.all([
      countPromise,
      userStarPromise,
    ]);

    return NextResponse.json({
      count: count,
      isStarred: !!userStar,
    });
  } catch (error) {
    console.error(
      `Error fetching star status for snippet ${snippetId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch star status" },
      { status: 500 }
    );
  }
}

// POST /api/snippets/[id]/stars - Toggle starring a snippet
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: snippetId } = params; // Keep using snippetId internally for clarity
  const { userId } = await auth();

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
    const existingStar = await prisma.star.findUnique({
      where: {
        userId_snippetId: {
          userId: userId,
          snippetId: snippetId,
        },
      },
    });

    let result;
    let status = 200;

    if (existingStar) {
      await prisma.star.delete({
        where: {
          id: existingStar.id,
        },
      });
      result = { starred: false, message: "Snippet unstarred" };
    } else {
      const snippetExists = await prisma.snippet.findUnique({
        where: { id: snippetId },
        select: { id: true },
      });
      if (!snippetExists) {
        return NextResponse.json(
          { error: "Snippet not found" },
          { status: 404 }
        );
      }

      await prisma.star.create({
        data: {
          userId: userId,
          snippetId: snippetId,
        },
      });
      result = { starred: true, message: "Snippet starred" };
      status = 201;
    }

    return NextResponse.json(result, { status });
  } catch (error) {
    console.error(`Error toggling star for snippet ${snippetId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Snippet not found" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to toggle star status" },
      { status: 500 }
    );
  }
}
