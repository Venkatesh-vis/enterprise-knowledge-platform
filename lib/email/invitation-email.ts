import "server-only";

import { getCurrentUser } from "@/lib/auth/get-current-user";

import { sendMailjetEmail } from "./mailjet";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function invitationUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) throw new Error("NEXT_PUBLIC_APP_URL is required.");
  return `${base.replace(/\/$/, "")}/invitations/${token}`;
}

export async function sendInvitationEmail(input: {
  email: string;
  name: string;
  organizationName: string;
  roleName: string;
  token: string;
  inviterName?: string;
  inviterEmail?: string;
}) {
  const inviter = await getCurrentUser();
  const inviterName =
    input.inviterName?.trim() || inviter?.user.name?.trim();
  const inviterEmail =
    input.inviterEmail?.trim().toLowerCase() ||
    inviter?.user.email?.trim().toLowerCase();

  if (!inviterName || !inviterEmail) {
    throw new Error("Unable to determine the invitation sender.");
  }

  const url = invitationUrl(input.token);
  const safeName = escapeHtml(input.name);
  const safeOrganization = escapeHtml(input.organizationName);
  const safeRole = escapeHtml(input.roleName);
  const safeInviter = escapeHtml(inviterName);
  const safeUrl = escapeHtml(url);

  await sendMailjetEmail({
    toEmail: input.email,
    toName: input.name,
    fromEmail: inviterEmail,
    fromName: inviterName,
    replyToEmail: inviterEmail,
    replyToName: inviterName,
    subject: `You're invited to join ${input.organizationName}`,
    text: `Hi ${input.name},\n\n${inviterName} invited you to join ${input.organizationName} as ${input.roleName}.\n\nAccept your invitation:\n${url}\n\nThis invitation expires in 7 days.`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px"><div style="max-width:600px;margin:auto;background:#fff;padding:32px;border-radius:16px;border:1px solid #e2e8f0"><h1>You're invited</h1><p>Hi ${safeName}, ${safeInviter} invited you to join ${safeOrganization}.</p><p>Assigned role: <strong>${safeRole}</strong></p><p><a href="${safeUrl}" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none">Accept invitation</a></p><p style="color:#64748b;font-size:12px">This invitation expires in 7 days.</p></div></body></html>`,
  });
}
