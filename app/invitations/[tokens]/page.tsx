import type { Metadata } from "next";

import { InvitationPage } from "./components/invitation-page";

interface InvitationRouteProps {
  params: Promise<{
    token: string;
  }>;
}

export const metadata: Metadata = {
  title: "Organization Invitation",
  description:
    "Accept your invitation to join an organization.",
};

export default async function InvitationRoute({
  params,
}: InvitationRouteProps) {
  const { token } = await params;

  return <InvitationPage token={token} />;
}