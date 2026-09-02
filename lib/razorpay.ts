import Razorpay from "razorpay";
import crypto from "node:crypto";

/**
 * Constant-time signature comparison that never throws.
 * `crypto.timingSafeEqual` throws when buffers differ in length, so a
 * malformed/short signature must be treated as invalid (false) rather than
 * bubbling up as a 500 error.
 */
function safeTimingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay credentials not found. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in your environment variables."
      );
    }
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayClient;
}

export function getRazorpayKeyId(): string {
  // The checkout key MUST be the same key that was used to create the order
  // server-side (RAZORPAY_KEY_ID). Razorpay returns a 401 ("The id provided does
  // not exist") when the order_id and the checkout key come from different keys.
  // The key is delivered to the browser via the create-order API, so a separate
  // NEXT_PUBLIC_ key is neither needed nor safe (it can drift out of sync).
  return process.env.RAZORPAY_KEY_ID ?? "";
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not set");
  }
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return safeTimingSafeEqual(expected, signature);
}

export function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    return false;
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return safeTimingSafeEqual(expected, signature);
}
