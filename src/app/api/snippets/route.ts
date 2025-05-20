import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// GET /api/snippets - Fetch all snippets
export async function GET() {
  try {
    // TODO: Add pagination, filtering, sorting later if needed
    const snippets = await prisma.snippet.findMany({
      orderBy: {
        createdAt: "desc", // Default sort: newest first
      },
      // Optionally include related data like user, stars count, comments count
      // include: { _count: { select: { stars: true, comments: true } } }
    });
    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { error: "Failed to fetch snippets" },
      { status: 500 }
    );
  }
}

// POST /api/snippets - Create a new snippet
export async function POST(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, language, code } = body;

    if (!title || !language || !code) {
      return NextResponse.json(
        { error: "Missing required fields: title, language, code" },
        { status: 400 }
      );
    }

    // Clerk provides name in sessionClaims if available
    const userName =
      typeof sessionClaims?.fullName === "string"
        ? sessionClaims.fullName
        : "Anonymous";

    const newSnippet = await prisma.snippet.create({
      data: {
        userId,
        userName, // Use name from Clerk session
        title,
        language,
        code,
      },
    });

    return NextResponse.json(newSnippet, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Error creating snippet:", error);
    // Handle potential Prisma errors, e.g., validation errors
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create snippet" },
      { status: 500 }
    );
  }
}
