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
  const page = Number(params.page ?? "1",);
  const pageSize = Number(params.pageSize ?? "20",);

  const data =
    await getUsersDirectoryData({
      search: params.search?.trim() || undefined,
      roleId: params.roleId || undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    });

  return (
    <UsersPage
      data={data}
    />
  );
}