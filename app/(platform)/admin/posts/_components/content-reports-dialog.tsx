'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Ban, CheckCircle, Loader2, Siren } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ReportDTO, ReportStatus } from '@/models/report/reportDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { formatDateVN } from '@/utils/user.utils';

const statusLabel: Record<ReportStatus, { label: string; className: string }> = {
  [ReportStatus.PENDING]: {
    label: 'Chờ xử lý',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  [ReportStatus.RESOLVED]: {
    label: 'Đã xử lý',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  [ReportStatus.REJECTED]: {
    label: 'Đã từ chối',
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
};

type ContentReportsDialogProps = {
  entryId?: string;
  targetType?: TargetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ReportItem({
  report,
  onResolveTarget,
  onReject,
  resolving,
  rejecting,
}: {
  report: ReportDTO;
  onResolveTarget: () => void;
  onReject: (reportId: string) => void;
  resolving: boolean;
  rejecting: boolean;
}) {
  const meta = statusLabel[report.status];
  const isPending = report.status === ReportStatus.PENDING;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-800">#{report.id}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50">{report.targetType}</Badge>
          <Badge variant="secondary" className={meta.className}>
            {meta.label}
          </Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-700">{report.reason}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>Mã người báo cáo: {report.reporterId}</div>
        <div>Ngày tạo: {formatDateVN(report.createdAt)}</div>
      </div>
      {isPending ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={resolving}
            onClick={onResolveTarget}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            {resolving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-1 h-4 w-4" />
            )}
            {resolving ? 'Đang xử lý...' : 'Đánh dấu xử lý'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={rejecting}
            onClick={() => onReject(report.id)}
          >
            {rejecting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Ban className="mr-1 h-4 w-4" />}
            {rejecting ? 'Đang từ chối...' : 'Từ chối'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ContentReportsDialog({ entryId, targetType, open, onOpenChange }: ContentReportsDialogProps) {
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

  const reports = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const rejectingId = rejectReportMutation.variables;

  const handleResolveTarget = () => {
    if (!entryId || !targetType) return;
    resolveTargetMutation.mutate();
  };

  const handleRejectReport = (reportId: string) => {
    rejectReportMutation.mutate(reportId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] border-sky-100">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Báo cáo liên quan</DialogTitle>
          <DialogDescription>
            Xem danh sách báo cáo và xử lý trực tiếp từng trường hợp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-slate-700">Bộ lọc báo cáo</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Trạng thái:</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ReportStatus | 'all')}
              >
                <SelectTrigger className="h-9 w-[140px] border-sky-100 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value={ReportStatus.PENDING}>Chờ xử lý</SelectItem>
                  <SelectItem value={ReportStatus.RESOLVED}>Đã xử lý</SelectItem>
                  <SelectItem value={ReportStatus.REJECTED}>Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!entryId ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-600">
              Chưa chọn nội dung để xem báo cáo.
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải báo cáo...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              Không thể tải báo cáo.{' '}
              <button className="font-semibold underline" onClick={() => refetch()}>
                Thử lại
              </button>
            </div>
          ) : null}

          {!isLoading && reports.length === 0 && entryId ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-600">
              Không có báo cáo nào cho nội dung này.
            </div>
          ) : null}

          {reports.map((report) => (
            <ReportItem
              key={report.id}
              report={report}
              onResolveTarget={handleResolveTarget}
              onReject={handleRejectReport}
              resolving={resolveTargetMutation.isPending}
              rejecting={rejectReportMutation.isPending && rejectingId === report.id}
            />
          ))}
        </div>

        <Separator />

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Siren className="h-4 w-4 text-amber-500" />
            Sử dụng hành động nhanh để ẩn nội dung hoặc thông báo cho người đăng.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleResolveTarget}
              disabled={!entryId || !targetType || resolveTargetMutation.isPending}
              className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              <AlertTriangle className="mr-1 h-4 w-4" />
              {resolveTargetMutation.isPending ? 'Đang xử lý...' : 'Ẩn nội dung'}
            </Button>
            {hasNextPage ? (
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="bg-sky-600 text-white hover:bg-sky-700"
              >
                {isFetchingNextPage ? 'Đang tải thêm...' : 'Tải thêm báo cáo'}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
