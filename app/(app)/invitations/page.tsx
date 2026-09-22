import { getInvitationPageData } from "@/lib/invitations/service";
import { InvitationsManager } from "./components/invitations-manager";

export default async function InvitationsPageRoute() {
  const data = await getInvitationPageData();
  return <InvitationsManager initialData={data} />;
}
