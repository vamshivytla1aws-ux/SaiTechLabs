import { Resend } from "resend";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function mailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    throw new Error("Email is not configured. Add RESEND_API_KEY and RESEND_FROM to Railway variables.");
  }
  return { apiKey, from };
}

export function applicationBaseUrl() {
  return (process.env.APP_URL || "https://www.saitechlabs.in").replace(/\/$/, "");
}

export async function sendInterviewInvitation(input: { candidateName: string; email: string; technologies: string[]; durationMinutes: number; expiresAt: Date; token: string }) {
  const config = mailConfig();
  const link = `${applicationBaseUrl()}/interview/${encodeURIComponent(input.token)}`;
  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: input.email,
    subject: "Your SaiTech Labs Mock AI Interview invitation",
    text: `Hello ${input.candidateName},\n\nYour ${input.technologies.join(" + ")} Mock AI Interview is ready. Duration: ${input.durationMinutes} minutes. Complete it before ${input.expiresAt.toLocaleString("en-IN")}.\n\nOpen interview: ${link}\n\nThe timer starts only after you accept the instructions and select Start Interview.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#102142"><h2>SaiTech Labs Mock AI Interview</h2><p>Hello ${escapeHtml(input.candidateName)},</p><p>Your <strong>${escapeHtml(input.technologies.join(" + "))}</strong> Mock AI Interview is ready.</p><p><strong>Duration:</strong> ${input.durationMinutes} minutes<br><strong>Complete before:</strong> ${escapeHtml(input.expiresAt.toLocaleString("en-IN"))}</p><p><a href="${link}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#185be8;color:white;text-decoration:none;font-weight:bold">Open secure interview</a></p><p>The timer starts only after you accept the instructions and select Start Interview.</p></div>`,
  });
  if (error) throw new Error(`Resend could not send the invitation: ${error.message}`);
  return link;
}
