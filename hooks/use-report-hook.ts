"use client";

import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createReport,
  getReports,
  rejectReport,
  ReportFilterDTO,
  resolveReportTarget,
} from '@/lib/actions/admin/report-action';
import { CreateReportForm, ReportDTO, ReportStatus } from '@/models/report/reportDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { CursorPageResponse } from '@/lib/cursor-pagination.dto';

export const useCreateReport = () => {
  const { getToken } = useAuth();
  return useMutation({
    mutationKey: ['create-report'],
    mutationFn: async (data: CreateReportForm) => {
      const token = await getToken();
      if (!token) throw new Error('Unauthorized');
      return await createReport(token, data);
    },
    onSuccess: () => {
      toast.success('Tạo báo cáo thành công');
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi tạo báo cáo');
    },
  });
};

export const useReportsByTarget = (
  targetId?: string,
  targetType?: TargetType,
  status?: ReportStatus | 'all'
) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const reportsQuery = useInfiniteQuery<CursorPageResponse<ReportDTO>>({
    queryKey: ['admin-reports', targetId, targetType, status ?? 'all'],
    enabled: Boolean(targetId && targetType),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      const filter: ReportFilterDTO = {
        targetId,
        targetType,
        cursor: pageParam,
        limit: 5,
        status: status && status !== 'all' ? status : undefined,
      };

      return getReports(token, filter);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
  });

  const resolveTargetMutation = useMutation({
    mutationFn: async () => {
      if (!targetId || !targetType) throw new Error('Target is required');

      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return resolveReportTarget(token, targetId, targetType);
    },
    onSuccess: () => {
      queryClient.setQueryData<InfiniteData<CursorPageResponse<ReportDTO>>>(
        ['admin-reports', targetId, targetType, status ?? 'all'],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data
                .map((report) => ({
                  ...report,
                  status:
                    report.status === ReportStatus.RESOLVED
                      ? report.status
                      : ReportStatus.RESOLVED,
                }))
                .filter((report) =>
                  status && status !== 'all' ? report.status === status : true
                ),
            })),
            pageParams: old.pageParams,
          };
        }
      );
    },
  });

  const rejectReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return rejectReport(token, reportId);
    },
    onSuccess: (updatedReport) => {
      queryClient.setQueryData<InfiniteData<CursorPageResponse<ReportDTO>>>(
        ['admin-reports', targetId, targetType, status ?? 'all'],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data
                .map((report) =>
                  report.id === updatedReport.id
                    ? { ...report, status: updatedReport.status }
                    : report
                )
                .filter((report) =>
                  status && status !== 'all' ? report.status === status : true
                ),
            })),
            pageParams: old.pageParams,
          };
        }
      );
    },
  });

  return {
    ...reportsQuery,
    resolveTargetMutation,
    rejectReportMutation,
  };
};
