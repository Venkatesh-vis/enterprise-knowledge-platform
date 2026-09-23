import "server-only";

import axios from "axios";

const MAILJET_URL =
  "https://api.mailjet.com/v3.1/send";

type MailRecipient = {
  email: string;
  name?: string;
};

type SendMailjetEmailInput = {
  to: MailRecipient[];

  from: MailRecipient;

  replyTo?: MailRecipient;

  cc?: MailRecipient[];

  bcc?: MailRecipient[];

  subject: string;

  text: string;

  html: string;
};

function mapRecipients(
  recipients: MailRecipient[],
) {
  return recipients.map(
    (recipient) => ({
      Email: recipient.email,

      ...(recipient.name
        ? {
            Name: recipient.name,
          }
        : {}),
    }),
  );
}

function validateRecipient(
  recipient: MailRecipient,
) {
  if (!recipient.email?.trim()) {
    throw new Error(
      "Recipient email is required.",
    );
  }
}

export async function sendMailjetEmail(
  input: SendMailjetEmailInput,
) {
  const apiKey =
    process.env.MAILJET_API_KEY?.trim();

  const secret =
    process.env.MAILJET_API_SECRET?.trim();

  if (!apiKey || !secret) {
    throw new Error(
      "Mail service is not configured.",
    );
  }

  if (!input.from.email?.trim()) {
    throw new Error(
      "Sender email is required.",
    );
  }

  if (!input.from.name?.trim()) {
    throw new Error(
      "Sender name is required.",
    );
  }

  if (!input.to.length) {
    throw new Error(
      "At least one recipient is required.",
    );
  }

  input.to.forEach(
    validateRecipient,
  );

  input.cc?.forEach(
    validateRecipient,
  );

  input.bcc?.forEach(
    validateRecipient,
  );

  const auth = Buffer.from(
    `${apiKey}:${secret}`,
  ).toString("base64");

  const message = {
    From: {
      Email:
        input.from.email,
      Name:
        input.from.name,
    },

    To: mapRecipients(
      input.to,
    ),

    ...(input.cc?.length
      ? {
          Cc: mapRecipients(
            input.cc,
          ),
        }
      : {}),

    ...(input.bcc?.length
      ? {
          Bcc: mapRecipients(
            input.bcc,
          ),
        }
      : {}),

    ...(input.replyTo
      ? {
          ReplyTo: {
            Email:
              input.replyTo.email,
            Name:
              input.replyTo.name ||
              input.from.name,
          },
        }
      : {}),

    Subject:
      input.subject,

    TextPart:
      input.text,

    HTMLPart:
      input.html,
  };

  try {
    const response =
      await axios.post(
        MAILJET_URL,
        {
          Messages: [
            message,
          ],
        },
        {
          headers: {
            Authorization:
              `Basic ${auth}`,

            "Content-Type":
              "application/json",
          },

          timeout: 15000,
        },
      );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status =
        error.response?.status;

      const details =
        error.response?.data;

      const message =
        typeof details === "string"
          ? details
          : details?.ErrorMessage ||
            details?.ErrorInfo ||
            JSON.stringify(
              details,
            );

      throw new Error(
        message
          ? `Mailjet delivery failed (${status ?? "unknown"}): ${message}`
          : `Mailjet delivery failed (${status ?? "unknown"}).`,
      );
    }

    throw error;
  }
}