import { logger } from '../utils/logger.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const getSender = () => process.env.EMAIL_FROM || 'Melodic Vault <onboarding@resend.dev>';
const getBrandName = () => process.env.BRAND_NAME || 'Melodic Vault';
const getSupportEmail = () => process.env.BRAND_SUPPORT_EMAIL || 'support@melodicvault.local';

const buildOtpHtml = ({ otp, purpose, ttlMinutes }) => {
  const brand = getBrandName();

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#f7f9ff;padding:24px;color:#0f172a;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:3px solid #0f172a;border-radius:14px;overflow:hidden;">
        <div style="background:#1E6BFF;color:#ffffff;padding:18px 22px;border-bottom:3px solid #0f172a;">
          <h1 style="margin:0;font-size:22px;letter-spacing:.08em;text-transform:uppercase;">${brand}</h1>
        </div>
        <div style="padding:24px 22px;">
          <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">Use this one-time code to complete your ${purpose}.</p>
          <div style="font-size:34px;font-weight:900;letter-spacing:.18em;background:#FFD600;border:3px solid #0f172a;border-radius:10px;padding:14px 18px;text-align:center;">
            ${otp}
          </div>
          <p style="font-size:14px;line-height:1.5;margin:18px 0 0;color:#475569;">This code expires in ${ttlMinutes} minutes. If you did not request this, ignore this email or contact ${getSupportEmail()}.</p>
        </div>
      </div>
    </div>
  `;
};

export const sendAuthOtpEmail = async ({ email, otp, purpose, ttlMinutes }) => {
  if (!process.env.RESEND_API_KEY) {
    logger.warn(`RESEND_API_KEY missing; OTP email not sent to ${email}`);
    return false;
  }

  const { error } = await resend.emails.send({
      from: getSender(),
      to: [email],
      subject: `${getBrandName()} OTP for ${purpose}`,
      html: buildOtpHtml({ otp, purpose, ttlMinutes }),
      text: `Your ${getBrandName()} OTP for ${purpose} is ${otp}. It expires in ${ttlMinutes} minutes.`,
  });

  if (error) {
    throw new Error(`Resend email failed: ${error.message}`);
  }

  logger.info(`OTP email sent to ${email} for ${purpose}`);
  return true;
};
