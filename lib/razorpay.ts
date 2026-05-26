import Razorpay from "razorpay";
import crypto from "node:crypto";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: requireEnv("RAZORPAY_KEY_ID"),
      key_secret: requireEnv("RAZORPAY_KEY_SECRET"),
    });
  }
  return razorpayClient;
}

export function getRazorpayKeyId(): string {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? ""
  );
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = requireEnv("RAZORPAY_KEY_SECRET");
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return expected === signature;
}

export function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}
