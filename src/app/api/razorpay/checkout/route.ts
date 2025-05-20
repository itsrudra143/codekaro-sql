import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay"; // Import the initialized Razorpay instance

const AMOUNT_INR = 500;
const CURRENCY = "INR";

export async function POST(_req: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser || !clerkUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = clerkUser.id;

  if (!razorpay) {
    console.error("Razorpay instance is not available. Check API keys.");
    return NextResponse.json(
      { error: "Payment provider configuration error." },
      { status: 500 }
    );
  }

  try {
    let user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      const emailAddress = clerkUser.primaryEmailAddress?.emailAddress;
      if (!emailAddress) {
        console.error(
          "Clerk user primary email address not found for ID:",
          userId
        );
        return NextResponse.json(
          { error: "User primary email not found." },
          { status: 400 }
        );
      }
      user = await prisma.user.create({
        data: {
          userId,
          email: emailAddress,
          name: clerkUser.firstName || clerkUser.username || "",
          isPro: false,
        },
      });
    }

    const orderOptions = {
      amount: AMOUNT_INR * 100, // Razorpay expects amount in paisa
      currency: CURRENCY,
      receipt: `rcpt_${Date.now().toString().slice(-8)}${userId.slice(-6)}`,
      notes: {
        userId: userId,
        userEmail: user.email,
        plan: "Pro Lifetime",
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    if (!order) {
      console.error("Razorpay order creation failed.");
      return NextResponse.json(
        { error: "Failed to create payment order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID, // Send key ID to client for Razorpay script
      amount: order.amount, // Amount in paisa
      currency: order.currency,
      userName: user.name,
      userEmail: user.email,
      // userPhone: user.phone // If you collect phone numbers
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create order.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
