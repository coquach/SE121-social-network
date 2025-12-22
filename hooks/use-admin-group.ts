/* ====================== GROUP REPORTS ====================== */

import { getGroupReports, GroupReportQuery } from "@/lib/actions/admin/admin-group-action";
import { CursorPageResponse, CursorPagination } from "@/lib/cursor-pagination.dto";
import { GroupReportDTO } from "@/models/group/groupReportDTO";
import { useAuth } from "@clerk/nextjs";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetGroupReports = (
  groupId: string,
  query: CursorPagination
) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupReportDTO>>({
    queryKey: ['group-reports', groupId, query],
    enabled: !!groupId,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupReports(token, {
        ...query,
        cursor: pageParam,
        groupId,
      } as GroupReportQuery);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });
};
