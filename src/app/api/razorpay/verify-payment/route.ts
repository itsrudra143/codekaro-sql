import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay"; // For signature verification utility
import crypto from "crypto";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(_req: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser || !clerkUser.id) {
    return NextResponse.json(
      { error: "Unauthorized - No Clerk user" },
      { status: 401 }
    );
  }
  const clerkUserId = clerkUser.id;

  if (!RAZORPAY_KEY_SECRET) {
    console.error("Razorpay Key Secret is not configured.");
    return NextResponse.json(
      { error: "Server payment configuration error." },
      { status: 500 }
    );
  }

  const body = await _req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing Razorpay payment details." },
      { status: 400 }
    );
  }

  try {
    // 1. Verify the signature
    const digest = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (digest !== razorpay_signature) {
      console.warn("Invalid Razorpay signature.", {
        received: razorpay_signature,
        generated: digest,
      });
      return NextResponse.json(
        { error: "Invalid payment signature." },
        { status: 400 }
      );
    }

    // 2. Fetch order details from Razorpay to confirm amount and get notes (especially userId)
    // This step is crucial to prevent users from tampering with amounts on client-side or claiming others' orders.
    if (!razorpay) {
      console.error("Razorpay instance is not available for fetching order.");
      return NextResponse.json(
        { error: "Payment provider temporarily unavailable." },
        { status: 503 }
      );
    }
    const fetchedOrder = await razorpay.orders.fetch(razorpay_order_id);
    if (!fetchedOrder) {
      console.error(`Could not fetch Razorpay order: ${razorpay_order_id}`);
      return NextResponse.json(
        { error: "Could not verify order details with provider." },
        { status: 500 }
      );
    }

    const internalUserId = fetchedOrder.notes?.userId;
    const expectedAmount = 500 * 100; // 500 INR in paisa

    if (fetchedOrder.amount !== expectedAmount) {
      console.warn(
        `Amount mismatch for order ${razorpay_order_id}. Expected: ${expectedAmount}, Got: ${fetchedOrder.amount}`
      );
      return NextResponse.json(
        { error: "Payment amount mismatch." },
        { status: 400 }
      );
    }

    if (!internalUserId) {
      console.error(
        `User ID not found in Razorpay order notes for order: ${razorpay_order_id}`
      );
      return NextResponse.json(
        { error: "Critical: User ID missing from order notes." },
        { status: 400 }
      );
    }

    // Security check: Ensure the logged-in user (clerkUserId) matches the userId from the order notes
    if (clerkUserId !== internalUserId) {
      console.warn(
        `Unauthorized attempt to claim order. Clerk User: ${clerkUserId}, Order User: ${internalUserId}`
      );
      return NextResponse.json(
        { error: "Order ownership mismatch." },
        { status: 403 }
      );
    }

    // 3. Update user in Prisma database
    const updatedUser = await prisma.user.update({
      where: { userId: String(internalUserId) },
      data: {
        isPro: true,
        proSince: new Date(),
        // Store Razorpay specific IDs if needed for refunds, records etc.
        // Ensure these fields are added to your schema.prisma and migrated
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and account upgraded!",
      isPro: updatedUser.isPro,
    });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to verify payment.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
