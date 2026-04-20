import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "noreply@snehmatrimonyindia.com";
const FROM = `Sneh Matrimony <${FROM_ADDRESS}>`;
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email – Sneh Matrimony",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;">
        <h2 style="font-size:22px;color:#1e0a14;margin-bottom:8px;">Verify your email address</h2>
        <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:24px;">
          Thanks for joining Sneh Matrimony. Click the button below to verify your email address.
          This link expires in <strong>24 hours</strong>.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#9b1c4a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:15px;font-weight:600;">
          Verify Email
        </a>
        <p style="margin-top:24px;color:#94a3b8;font-size:13px;">
          Or copy this link into your browser:<br/>
          <span style="color:#9b1c4a;word-break:break-all;">${verifyUrl}</span>
        </p>
        <p style="margin-top:32px;color:#cbd5e1;font-size:12px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
