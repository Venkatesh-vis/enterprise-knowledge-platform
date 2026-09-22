import { requirePermission } from "@/lib/auth/authorization";
import {
  createMockInvitationData,
} from "@/lib/invitations/mock-data";

import { InvitationsPage } from "./components/invitations-page";

export default async function InvitationsPageRoute() {
  const auth =
    await requirePermission(
      "INVITATION_READ",
    );

  const mockData =
    createMockInvitationData(
      auth.organization.name,
      auth.organization.id,
    );

  return (
    <InvitationsPage
      data={mockData}
      permissions={auth.permissions}
      currentUserName={auth.user.name}
      currentRole={
        auth.membership.role
      }
    />
  );
}