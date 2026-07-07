import { NextResponse } from "next/server";
import { fulfillPayment } from "@/lib/payment-fulfillment";
import { verifyWebhookSignature } from "@/lib/razorpay";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        status?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    const bodyText = await request.text();

    if (!verifyWebhookSignature(bodyText, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(bodyText) as RazorpayWebhookPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const event = payload.event;
    if (event !== "payment.captured" && event !== "order.paid") {
      return NextResponse.json({ received: true });
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId || !paymentId) {
      return NextResponse.json({ received: true });
    }

    if (paymentEntity?.status && paymentEntity.status !== "captured") {
      return NextResponse.json({ received: true });
    }

    try {
      await fulfillPayment(orderId, paymentId);
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("webhook fulfill error:", error);
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
