import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn(
    "Razorpay Key ID or Key Secret is not set. Razorpay functionality will be disabled."
  );
}

// Ensure keys are defined before initializing, or Razorpay will throw an error
// In a real app, you might want to prevent the app from starting or disable payment features more gracefully.
let razorpayInstance: Razorpay | null = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} else {
  console.error(
    "Razorpay instance could not be created due to missing API keys."
  );
}

export const razorpay = razorpayInstance;
