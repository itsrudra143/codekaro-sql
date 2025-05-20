import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserStats } from "@/types"; // Import the type we defined

const prisma = new PrismaClient();

interface RouteParams {
  params: { userId: string };
}

// GET /api/users/[userId]/stats
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const routeUserId = params.userId; // The userId from the URL
  const { userId: authUserId } = await auth(); // The currently authenticated user

  // Basic check: Is the authenticated user requesting their own stats?
  // You might relax this for admin roles or public profiles later.
  if (!authUserId || authUserId !== routeUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // 1. Fetch all code executions for the user
    const executionsPromise = prisma.codeExecution.findMany({
      where: { userId: routeUserId },
      select: {
        language: true,
        createdAt: true,
      },
    });

    // 2. Fetch all snippets created by the user
    const snippetsPromise = prisma.snippet.findMany({
      where: { userId: routeUserId },
      select: {
        id: true,
        language: true,
        _count: { select: { stars: true } }, // Count stars per snippet
      },
    });

    // 3. Fetch all stars given by the user (to count total stars given, maybe not needed?)
    // const starsGivenPromise = prisma.star.count({ where: { userId: routeUserId } });

    // Run fetches in parallel
    const [executions, snippets] = await Promise.all([
      executionsPromise,
      snippetsPromise,
    ]);

    // --- Calculate Stats ---

    // Total executions
    const totalExecutions = executions.length;

    // Languages used & count & favorite
    const languageCounts: Record<string, number> = {};
    executions.forEach((ex) => {
      languageCounts[ex.language] = (languageCounts[ex.language] || 0) + 1;
    });
    const languagesUsed = Object.keys(languageCounts);
    const favoriteLanguage = languagesUsed.reduce(
      (fav, lang) => (languageCounts[lang] > languageCounts[fav] ? lang : fav),
      languagesUsed[0] || null
    );

    // Executions in the last 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last24Hours = executions.filter(
      (ex) => ex.createdAt >= twentyFourHoursAgo
    ).length;

    // Total snippets created
    const totalSnippets = snippets.length;

    // Total stars received on user's snippets
    const totalStars = snippets.reduce((sum, sn) => sum + sn._count.stars, 0);

    // Most starred language (based on user's snippets)
    const starsPerLanguage: Record<string, number> = {};
    snippets.forEach((sn) => {
      starsPerLanguage[sn.language] =
        (starsPerLanguage[sn.language] || 0) + sn._count.stars;
    });
    const mostStarredLanguage = Object.keys(starsPerLanguage).reduce(
      (fav, lang) =>
        starsPerLanguage[lang] > starsPerLanguage[fav] ? lang : fav,
      Object.keys(starsPerLanguage)[0] || null
    );

    // --- Assemble Result ---
    const stats: UserStats = {
      totalExecutions,
      languagesUsed,
      totalSnippets,
      totalStars,
      last24Hours,
      favoriteLanguage,
      mostStarredLanguage,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error(`Error fetching stats for user ${routeUserId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
