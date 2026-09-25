import { Pagination } from "@/app/shared/ui/pagination";

export function HistoryPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  searchParams?: string;
}) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      itemLabel="events"
    />
  );
}
