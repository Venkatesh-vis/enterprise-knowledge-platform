export type InvitationTemplateInput = {
  recipientName: string;

  organizationName: string;

  roleName: string;

  inviterName: string;

  invitationUrl: string;
};

export type EmailTemplate = {
  subject: string;

  text: string;

  html: string;
};

function escapeHtml(
  value: string,
) {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

export function createInvitationTemplate(
  input: InvitationTemplateInput,
): EmailTemplate {
  const recipientName =
    input.recipientName.trim();

  const organizationName =
    input.organizationName.trim();

  const roleName =
    input.roleName.trim();

  const inviterName =
    input.inviterName.trim();

  const invitationUrl =
    input.invitationUrl.trim();

  const safeRecipientName =
    escapeHtml(
      recipientName,
    );

  const safeOrganizationName =
    escapeHtml(
      organizationName,
    );

  const safeRoleName =
    escapeHtml(
      roleName,
    );

  const safeInviterName =
    escapeHtml(
      inviterName,
    );

  const safeInvitationUrl =
    escapeHtml(
      invitationUrl,
    );

  return {
    subject:
      `${inviterName} invited you to join ${organizationName}`,

    text:
      `Hi ${recipientName},

${inviterName} has invited you to join ${organizationName}.

Your assigned role:
${roleName}

What you can do next:
1. Open your invitation.
2. Review the organization and assigned role.
3. Accept the invitation to continue.

Accept your invitation:
${invitationUrl}

This invitation link expires in 7 days.

If you were not expecting this invitation, you can safely ignore this email.

Regards,
${organizationName}
`,

    html:
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>
      You're invited
    </title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background: #f5f7fb;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
      color: #172033;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background: #f5f7fb;
        padding: 40px 16px;
      "
    >
      <tr>
        <td align="center">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width: 620px;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              border: 1px solid #e7eaf0;
              box-shadow:
                0 12px 35px
                rgba(16, 24, 40, 0.08);
            "
          >

            <!-- Header -->

            <tr>
              <td
                style="
                  padding: 34px 40px;
                  background:
                    linear-gradient(
                      135deg,
                      #111827 0%,
                      #1f2937 100%
                    );
                "
              >

                <div
                  style="
                    color: #ffffff;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                  "
                >
                  ${safeOrganizationName}
                </div>

                <div
                  style="
                    margin-top: 12px;
                    color: #ffffff;
                    font-size: 30px;
                    line-height: 1.2;
                    font-weight: 700;
                  "
                >
                  You're invited
                </div>

                <div
                  style="
                    margin-top: 10px;
                    color: #d1d5db;
                    font-size: 14px;
                    line-height: 1.6;
                  "
                >
                  Join your organization's
                  knowledge workspace.
                </div>

              </td>
            </tr>

            <!-- Main -->

            <tr>
              <td
                style="
                  padding: 40px;
                "
              >

                <p
                  style="
                    margin: 0 0 18px;
                    font-size: 16px;
                    line-height: 1.7;
                  "
                >
                  Hi
                  <strong>
                    ${safeRecipientName}
                  </strong>,
                </p>

                <p
                  style="
                    margin: 0 0 18px;
                    font-size: 15px;
                    line-height: 1.8;
                    color: #475467;
                  "
                >
                  <strong>
                    ${safeInviterName}
                  </strong>
                  has invited you to join
                  <strong>
                    ${safeOrganizationName}
                  </strong>
                  as a
                  <strong>
                    ${safeRoleName}
                  </strong>.
                </p>

                <!-- Role Card -->

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    margin: 28px 0;
                    border: 1px solid #e5e7eb;
                    border-radius: 14px;
                  "
                >
                  <tr>

                    <td
                      style="
                        padding: 20px;
                        background: #f8fafc;
                        border-radius: 14px;
                      "
                    >

                      <div
                        style="
                          font-size: 12px;
                          font-weight: 600;
                          text-transform:
                            uppercase;
                          letter-spacing:
                            0.08em;
                          color: #667085;
                        "
                      >
                        Assigned role
                      </div>

                      <div
                        style="
                          margin-top: 8px;
                          font-size: 20px;
                          font-weight: 700;
                          color: #101828;
                        "
                      >
                        ${safeRoleName}
                      </div>

                    </td>

                  </tr>
                </table>

                <!-- CTA -->

                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    margin: 30px 0;
                  "
                >
                  <tr>
                    <td>

                      <a
                        href="${safeInvitationUrl}"
                        style="
                          display:
                            inline-block;
                          padding:
                            14px 24px;
                          border-radius:
                            10px;
                          background:
                            #111827;
                          color:
                            #ffffff;
                          font-size:
                            15px;
                          font-weight:
                            700;
                          text-decoration:
                            none;
                        "
                      >
                        Accept invitation
                      </a>

                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 0 0 16px;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #667085;
                  "
                >
                  Your invitation is valid
                  for 7 days.
                </p>

                <p
                  style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #667085;
                  "
                >
                  If the button doesn't work,
                  copy and paste this link
                  into your browser:
                </p>

                <p
                  style="
                    margin: 12px 0 0;
                    word-break:
                      break-all;
                    font-size: 13px;
                    line-height: 1.6;
                  "
                >
                  <a
                    href="${safeInvitationUrl}"
                    style="
                      color: #2563eb;
                      text-decoration:
                        none;
                    "
                  >
                    ${safeInvitationUrl}
                  </a>
                </p>

              </td>
            </tr>

            <!-- Footer -->

            <tr>
              <td
                style="
                  padding: 24px 40px;
                  background: #f8fafc;
                  border-top:
                    1px solid #eaecf0;
                "
              >

                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.7;
                    color: #98a2b3;
                  "
                >
                  You received this email
                  because an invitation was
                  created for your email address.
                </p>

                <p
                  style="
                    margin: 8px 0 0;
                    font-size: 12px;
                    color: #98a2b3;
                  "
                >
                  If you don't recognize this
                  invitation, no action is
                  required.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}