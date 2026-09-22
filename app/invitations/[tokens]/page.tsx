import type { Metadata } from "next";

import { getPublicInvitation } from "@/lib/invitations/service";
import { InvitationPage } from "./components/invitation-page";

interface InvitationRouteProps {
  params: Promise<{ tokens: string }>;
}

export const metadata: Metadata = {
  title: "Organization Invitation",
  description: "Accept your invitation to join an organization.",
};

export default async function InvitationRoute({ params }: InvitationRouteProps) {
  const { tokens } = await params;
  const data = await getPublicInvitation(tokens);
  return <InvitationPage token={tokens} data={data} />;
}
