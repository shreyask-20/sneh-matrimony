import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "noreply@snehmatrimony.com";
const FROM = `Sneh Matrimony <${FROM_ADDRESS}>`;

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
