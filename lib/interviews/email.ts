import nodemailer from "nodemailer";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function mailConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  if (!host || !user || !pass || !from) throw new Error("Email is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM to Railway variables.");
  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1) throw new Error("SMTP_PORT is invalid.");
  return { host, user, pass, from, port };
}

export function applicationBaseUrl() {
  return (process.env.APP_URL || "https://www.saitechlabs.in").replace(/\/$/, "");
}

export async function sendInterviewInvitation(input: { candidateName: string; email: string; technologies: string[]; durationMinutes: number; expiresAt: Date; token: string }) {
  const config = mailConfig();
  const link = `${applicationBaseUrl()}/interview/${encodeURIComponent(input.token)}`;
  const transporter = nodemailer.createTransport({ host: config.host, port: config.port, secure: config.port === 465, auth: { user: config.user, pass: config.pass } });
  await transporter.sendMail({
    from: config.from,
    to: input.email,
    subject: "Your SaiTech Labs mock interview invitation",
    text: `Hello ${input.candidateName},\n\nYour ${input.technologies.join(" + ")} mock interview is ready. Duration: ${input.durationMinutes} minutes. Complete it before ${input.expiresAt.toLocaleString("en-IN")}.\n\nOpen interview: ${link}\n\nThe timer starts only after you accept the instructions and select Start Interview.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#102142"><h2>SaiTech Labs Mock Interview</h2><p>Hello ${escapeHtml(input.candidateName)},</p><p>Your <strong>${escapeHtml(input.technologies.join(" + "))}</strong> mock interview is ready.</p><p><strong>Duration:</strong> ${input.durationMinutes} minutes<br><strong>Complete before:</strong> ${escapeHtml(input.expiresAt.toLocaleString("en-IN"))}</p><p><a href="${link}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#185be8;color:white;text-decoration:none;font-weight:bold">Open secure interview</a></p><p>The timer starts only after you accept the instructions and select Start Interview.</p></div>`,
  });
  return link;
}
