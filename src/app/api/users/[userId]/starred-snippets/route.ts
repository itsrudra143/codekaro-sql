import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

interface RouteParams {
  params: { userId: string };
}

// GET /api/users/[userId]/starred-snippets - Fetch snippets starred by the user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const routeUserId = params.userId;
  const { userId: authUserId } = await auth();

  // Check authorization
  if (!authUserId || authUserId !== routeUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Find all Star records for the user, and include the related Snippet data
    const starredEntries = await prisma.star.findMany({
      where: { userId: routeUserId },
      include: {
        snippet: true, // Include the full Snippet object
      },
      orderBy: {
        createdAt: "desc", // Order by when the star was created
      },
      // TODO: Add pagination if the starred list could become very large
    });

    // Extract just the snippet data from the results
    const starredSnippets = starredEntries.map((entry) => entry.snippet);

    return NextResponse.json(starredSnippets);
  } catch (error) {
    console.error(
      `Error fetching starred snippets for user ${routeUserId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch starred snippets" },
      { status: 500 }
    );
  }
}
