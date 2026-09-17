import { notFound } from "next/navigation";

import { getUserDetailData } from "@/lib/users/user-service";

import { UserDetailClient } from "./components/user-detail-client";

async function loadUserDetailData(id: string) {
  try {
    return await getUserDetailData(id);
  } catch {
    notFound();
  }
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const data = await loadUserDetailData(id);

  return <UserDetailClient data={data} />;
}