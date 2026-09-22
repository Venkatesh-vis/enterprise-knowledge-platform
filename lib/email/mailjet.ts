import "server-only";

const URL = "https://api.mailjet.com/v3.1/send";

export async function sendMailjetEmail(input: {
  toEmail: string;
  toName: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  replyToName?: string;
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.MAILJET_API_KEY?.trim();
  const secret = process.env.MAILJET_API_SECRET?.trim();

  if (!apiKey || !secret) {
    throw new Error("Mail service is not configured.");
  }

  if (!input.fromEmail || !input.fromName) {
    throw new Error("Sender name and email are required.");
  }

  const auth = Buffer.from(`${apiKey}:${secret}`).toString("base64");
  const message = {
    From: {
      Email: input.fromEmail,
      Name: input.fromName,
    },
    To: [{
      Email: input.toEmail,
      Name: input.toName,
    }],
    Subject: input.subject,
    TextPart: input.text,
    HTMLPart: input.html,
    ...(input.replyToEmail
      ? {
          ReplyTo: {
            Email: input.replyToEmail,
            Name: input.replyToName || input.fromName,
          },
        }
      : {}),
  };

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Messages: [message] }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      details
        ? `Email delivery failed (${response.status}): ${details}`
        : `Email delivery failed (${response.status}).`,
    );
  }
}
