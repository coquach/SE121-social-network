'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import { useGroupReports } from '@/hooks/use-admin-group';
import { AdminReportCard } from '../../_components/admin-report-card';

type GroupReportsDrawerProps = {
  groupId?: string;
  groupName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GroupReportsDrawer({ groupId, groupName, open, onOpenChange }: GroupReportsDrawerProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useGroupReports(groupId, {
    limit: 5,
  });

  const reports = React.useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] border-sky-100">
        <DialogHeader className="space-y-1 pr-4">
          <DialogTitle className="text-slate-800">Báo cáo nhóm</DialogTitle>
          <DialogDescription>
            Danh sách báo cáo liên quan đến {groupName ?? 'nhóm'} (ID: {groupId ?? 'N/A'})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : null}

          {!isLoading && reports.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-600">
              Không có báo cáo.
            </div>
          ) : null}

          {reports.map((report) => (
            <AdminReportCard key={report.id} report={report} showActions={false} />
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-end">
          {hasNextPage ? (
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage || isFetching}
              className="bg-sky-600 text-white hover:bg-sky-700"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tải thêm
                </>
              ) : (
                'Tải thêm'
              )}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
