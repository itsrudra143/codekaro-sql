import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request) {
  try {
    const userClerk = await currentUser();

    if (!userClerk || !userClerk.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { userId: userClerk.id },
      select: { isPro: true },
    });

    if (!user) {
      // If user not found in DB yet (e.g., new user not synced from Clerk webhook),
      // assume they are not Pro.
      return NextResponse.json({ isPro: false });
    }

    return NextResponse.json({ isPro: user.isPro });
  } catch (error) {
    console.error("Error fetching user pro status:", error);
    // Return a default non-pro status in case of an unexpected server error
    return NextResponse.json(
      { error: "Failed to fetch user status.", isPro: false },
      { status: 500 }
    );
  }
}
