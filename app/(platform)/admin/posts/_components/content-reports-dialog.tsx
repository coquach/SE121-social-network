'use client';

import { AlertTriangle, Info, Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { useReportsByTarget } from '@/hooks/use-report-hook';
import { ReportStatus } from '@/models/report/reportDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { ReportCard } from './report-card';

type ContentReportsDialogProps = {
  entryId?: string;
  targetType?: TargetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContentReportsDialog({
  entryId,
  targetType,
  open,
  onOpenChange,
}: ContentReportsDialogProps) {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
    refetch,
    resolveTargetMutation,
    rejectReportMutation,
  } = useReportsByTarget(entryId, targetType, statusFilter);

  const reports = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const rejectingId = rejectReportMutation.variables;

  const handleResolveTarget = () => {
    if (!entryId || !targetType) return;
    resolveTargetMutation.mutate();
  };

  const handleRejectReport = (reportId: string) => {
    rejectReportMutation.mutate(reportId);
  };

  const canAct = !!entryId && !!targetType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] border-sky-100">
        {/* Header gọn */}
        <DialogHeader className="space-y-2 pr-4">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-slate-800">Báo cáo</DialogTitle>

            {/* Filter gọn */}
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ReportStatus | 'all')}
            >
              <SelectTrigger className="h-9 w-[140px] border-sky-100 text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={ReportStatus.PENDING}>Chờ</SelectItem>
                <SelectItem value={ReportStatus.RESOLVED}>Đã xử lý</SelectItem>
                <SelectItem value={ReportStatus.REJECTED}>Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!canAct ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <Info className="h-4 w-4" />
              Chưa chọn nội dung.
            </div>
          ) : null}
        </DialogHeader>

        {/* Body */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              Lỗi tải báo cáo.{' '}
              <button
                className="font-semibold underline"
                onClick={() => refetch()}
              >
                Thử lại
              </button>
            </div>
          ) : null}

          {!isLoading && reports.length === 0 && canAct ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-600">
              Không có báo cáo.
            </div>
          ) : null}

          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onResolveTarget={handleResolveTarget}
              onReject={handleRejectReport}
              resolving={resolveTargetMutation.isPending}
              rejecting={
                rejectReportMutation.isPending && rejectingId === report.id
              }
            />
          ))}
        </div>

        <Separator />

        {/* Footer gọn: actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={handleResolveTarget}
            disabled={!canAct || resolveTargetMutation.isPending}
            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          >
            {resolveTargetMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Ẩn nội dung
          </Button>

          <div className="flex items-center gap-2 sm:justify-end">
            {hasNextPage ? (
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="bg-sky-600 text-white hover:bg-sky-700"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tải...
                  </>
                ) : (
                  'Tải thêm'
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
