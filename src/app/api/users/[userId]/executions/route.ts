import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

interface RouteParams {
  params: { userId: string };
}

// GET /api/users/[userId]/executions - Fetch user's code executions with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const routeUserId = params.userId;
  const { userId: authUserId } = await auth(); // The currently authenticated user

  // Check authorization
  if (!authUserId || authUserId !== routeUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Pagination parameters from query string
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "5", 10);

  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 50) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 }
    );
  }

  const skip = (page - 1) * limit;

  try {
    // Fetch the requested page of executions
    const executionsPromise = prisma.codeExecution.findMany({
      where: { userId: routeUserId },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: limit,
    });

    // Fetch the total count of executions for pagination info
    const countPromise = prisma.codeExecution.count({
      where: { userId: routeUserId },
    });

    const [executions, totalCount] = await Promise.all([
      executionsPromise,
      countPromise,
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const canLoadMore = page < totalPages;

    return NextResponse.json({
      executions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        canLoadMore, // Indicate if more pages are available
      },
    });
  } catch (error) {
    console.error(`Error fetching executions for user ${routeUserId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch user executions" },
      { status: 500 }
    );
  }
}
