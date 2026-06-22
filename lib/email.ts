import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "noreply@snehmatrimony.com";
const FROM = `Sneh Matrimony <${FROM_ADDRESS}>`;

export async function sendRefundRequestEmail({
  userName,
  userEmail,
  userPhone,
  plan,
  amountPaise,
  paymentId,
  reason,
  description,
}: {
  userName: string;
  userEmail: string;
  userPhone: string | null;
  plan: string;
  amountPaise: number;
  paymentId: string;
  reason: string;
  description: string;
}) {
  const amountRs = (amountPaise / 100).toFixed(0);
  await resend.emails.send({
    from: FROM,
    to: "snehmatrimonyindia@gmail.com",
    subject: `Refund Request – ${userName} (${plan} plan)`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;">
        <h2 style="font-size:20px;color:#1e0a14;margin-bottom:4px;">Refund Request</h2>
        <p style="color:#94a3b8;font-size:13px;margin-bottom:24px;">Submitted via Sneh Matrimony</p>

        <table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#64748b;">Name</td>
            <td style="padding:8px 0;">${userName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#64748b;">Email</td>
            <td style="padding:8px 0;"><a href="mailto:${userEmail}" style="color:#9b1c4a;">${userEmail}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#64748b;">Phone</td>
            <td style="padding:8px 0;">${userPhone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#64748b;">Plan</td>
            <td style="padding:8px 0;">${plan}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#64748b;">Amount Paid</td>
            <td style="padding:8px 0;">₹${amountRs}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#64748b;">Payment ID</td>
            <td style="padding:8px 0;font-family:monospace;font-size:13px;">${paymentId}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#64748b;">Reason</td>
            <td style="padding:8px 0;">${reason}</td>
          </tr>
          ${description ? `
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#64748b;vertical-align:top;">Description</td>
            <td style="padding:8px 0;">${description}</td>
          </tr>` : ""}
        </table>

        <div style="margin-top:24px;padding:16px;background:#fdf2f6;border-radius:12px;">
          <p style="font-size:13px;color:#9b1c4a;margin:0;">
            Review this request in the Razorpay dashboard and process the refund manually.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, otp: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password – Sneh Matrimony",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;">
        <h2 style="font-size:22px;color:#1e0a14;margin-bottom:8px;">Reset your password</h2>
        <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:24px;">
          We received a request to reset your Sneh Matrimony password. Enter the code below to continue.
          This code expires in <strong>15 minutes</strong>.
        </p>
        <div style="letter-spacing:12px;font-size:36px;font-weight:700;color:#9b1c4a;text-align:center;padding:24px 0;background:#fdf2f6;border-radius:12px;margin-bottom:24px;">
          ${otp}
        </div>
        <p style="color:#94a3b8;font-size:13px;text-align:center;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, otp: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your verification code – Sneh Matrimony",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;">
        <h2 style="font-size:22px;color:#1e0a14;margin-bottom:8px;">Verify your email address</h2>
        <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:24px;">
          Thanks for joining Sneh Matrimony. Enter the code below in the verification window.
          This code expires in <strong>15 minutes</strong>.
        </p>
        <div style="letter-spacing:12px;font-size:36px;font-weight:700;color:#9b1c4a;text-align:center;padding:24px 0;background:#fdf2f6;border-radius:12px;margin-bottom:24px;">
          ${otp}
        </div>
        <p style="color:#94a3b8;font-size:13px;text-align:center;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
