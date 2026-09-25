import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getUsersDirectoryData } from "@/lib/users/user-service";

import { UsersPage } from "./components/users-page";

type SearchParams = {
  search?: string;
  roleId?: string;
  page?: string;
  pageSize?: string;
};

export default async function UsersRoutePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const pageSize = Number(params.pageSize ?? "20");

  const [data, currentUser] = await Promise.all([
    getUsersDirectoryData({
      search: params.search?.trim() || undefined,
      roleId: params.roleId || undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize:
        Number.isFinite(pageSize) && pageSize > 0
          ? pageSize
          : 20,
    }),
    getCurrentUser(),
  ]);

  return (
    <UsersPage
      data={{
        ...data,
        canUpdate: currentUser?.permissions.includes("USER_UPDATE") ?? false,
        canDelete: currentUser?.permissions.includes("USER_DELETE") ?? false,
        currentUserId: currentUser?.user.id,
        currentRole: currentUser?.membership.role,
      }}
    />
  );
}
