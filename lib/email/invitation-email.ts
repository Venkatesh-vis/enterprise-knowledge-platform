import "server-only";

import {
  sendMailjetEmail,
} from "./mailjet";

import {
  createInvitationTemplate,
} from "./templates/invitation-template";

export async function sendInvitationEmail(
  input: {
    email: string;

    name: string;

    organizationName: string;

    roleName: string;

    token: string;

    inviterName: string;

    inviterEmail: string;
  },
) {
  const fromEmail =
    process.env
      .MAIL_FROM_EMAIL
      ?.trim()
      .toLowerCase();

  const fromName =
    process.env
      .MAIL_FROM_NAME
      ?.trim() ||
    "Enterprise Knowledge";

  if (!fromEmail) {
    throw new Error(
      "MAIL_FROM_EMAIL is required.",
    );
  }

  const inviterName =
    input.inviterName.trim();

  const inviterEmail =
    input.inviterEmail
      .trim()
      .toLowerCase();

  if (!inviterName) {
    throw new Error(
      "Invitation sender name is required.",
    );
  }

  if (!inviterEmail) {
    throw new Error(
      "Invitation sender email is required.",
    );
  }

  const baseUrl =
    process.env
      .NEXT_PUBLIC_APP_URL
      ?.trim();

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is required.",
    );
  }

  const invitationUrl =
    `${baseUrl.replace(/\/$/, "")}` +
    `/invitations/${input.token}`;

  const template =
    createInvitationTemplate({
      recipientName:
        input.name,

      organizationName:
        input.organizationName,

      roleName:
        input.roleName,

      inviterName,

      invitationUrl,
    });

  const sameEmail =
    input.email
      .trim()
      .toLowerCase() ===
    inviterEmail;

  await sendMailjetEmail({
    from: {
      email:
        fromEmail,

      name:
        fromName,
    },

    to: [
      {
        email:
          input.email,
        name:
          input.name,
      },
    ],

    replyTo: {
      email:
        inviterEmail,

      name:
        inviterName,
    },

    bcc: sameEmail
      ? undefined
      : [
          {
            email:
              inviterEmail,

            name:
              inviterName,
          },
        ],

    subject:
      template.subject,

    text:
      template.text,

    html:
      template.html,
  });
}