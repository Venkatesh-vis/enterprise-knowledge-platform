import "server-only";

const URL = "https://api.mailjet.com/v3.1/send";

export async function sendMailjetEmail(input: {
  toEmail: string;
  toName: string;
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.MAILJET_API_KEY?.trim();
  const secret = process.env.MAILJET_API_SECRET?.trim();
  const fromEmail = process.env.MAIL_FROM_EMAIL?.trim();
  const fromName = process.env.MAIL_FROM_NAME?.trim() || "Enterprise Knowledge";

  if (!apiKey || !secret || !fromEmail) {
    throw new Error("Mail service is not configured.");
  }

  const auth = Buffer.from(`${apiKey}:${secret}`).toString("base64");
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Messages: [{
        From: { Email: fromEmail, Name: fromName },
        To: [{ Email: input.toEmail, Name: input.toName }],
        Subject: input.subject,
        TextPart: input.text,
        HTMLPart: input.html,
      }],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed (${response.status}).`);
  }
}
