'use client';

import * as React from 'react';
import { Ban, Eye, Slash } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReportStatus, type ReportDTO } from '@/models/report/reportDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { ConfirmActionDialog } from '../../_components/confirm-action-dialog';
import { AdminPagination } from '../../_components/pagination';

type AdminReport = ReportDTO & {
  reporterName: string;
  totalReports: number;
};

type ActionState = {
  title: string;
  description?: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm?: () => void;
};

const reportsMock: AdminReport[] = [
  {
    id: 'RP001',
    reporterId: 'U001',
    reporterName: 'Nguyễn Văn A',
    groupId: 'GR-01',
    targetType: TargetType.POST,
    targetId: 'POST-01',
    reason: 'Bài đăng có nội dung không phù hợp',
    status: ReportStatus.PENDING,
    createdAt: new Date('2024-01-16'),
    totalReports: 15,
  },
  {
    id: 'RP002',
    reporterId: 'U002',
    reporterName: 'Trần Thị B',
    groupId: 'GR-02',
    targetType: TargetType.COMMENT,
    targetId: 'CMT-02',
    reason: 'Bình luận spam dưới bài viết của nhóm',
    status: ReportStatus.RESOLVED,
    createdAt: new Date('2024-01-15'),
    totalReports: 8,
  },
  {
    id: 'RP003',
    reporterId: 'U003',
    reporterName: 'Phạm Văn C',
    groupId: 'GR-03',
    targetType: TargetType.POST,
    targetId: 'POST-03',
    reason: 'Ảnh có dấu hiệu bạo lực',
    status: ReportStatus.REJECTED,
    createdAt: new Date('2024-01-14'),
    totalReports: 5,
  },
  {
    id: 'RP004',
    reporterId: 'U004',
    reporterName: 'Lê Hoàng D',
    groupId: 'GR-02',
    targetType: TargetType.SHARE,
    targetId: 'SHARE-01',
    reason: 'Video bị tố cáo vi phạm bản quyền',
    status: ReportStatus.PENDING,
    createdAt: new Date('2024-01-13'),
    totalReports: 11,
  },
];

const targetLabels: Record<TargetType, string> = {
  [TargetType.POST]: 'Bài viết',
  [TargetType.SHARE]: 'Chia sẻ',
  [TargetType.COMMENT]: 'Bình luận',
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

function StatusPill({ status }: { status: ReportStatus }) {
  const label =
    status === ReportStatus.REJECTED
      ? 'ĐÃ TỪ CHỐI'
      : status === ReportStatus.RESOLVED
        ? 'ĐÃ XỬ LÝ'
        : 'CHỜ XỬ LÝ';
  const color =
    status === ReportStatus.REJECTED
      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      : status === ReportStatus.RESOLVED
        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
        : 'bg-amber-100 text-amber-700 hover:bg-amber-200';

  return <Badge className={color}>{label}</Badge>;
}

export function ReportsTable() {
  const [page, setPage] = React.useState(1);
  const pageSize = 4;

  const total = reportsMock.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = reportsMock.slice(start, start + pageSize);

  const [action, setAction] = React.useState<ActionState | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openAction = (payload: ActionState) => {
    setAction(payload);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    action?.onConfirm?.();
    setDialogOpen(false);
    setAction(null);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-sky-100">
        <Table className="min-w-[960px]">
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="w-[120px]">Mã báo cáo</TableHead>
              <TableHead className="w-[170px]">Người báo cáo</TableHead>
              <TableHead className="w-[140px]">Loại đối tượng</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead className="w-[120px] text-center">Số lần</TableHead>
              <TableHead className="w-[140px]">Trạng thái</TableHead>
              <TableHead className="w-[150px]">Ngày báo cáo</TableHead>
              <TableHead className="w-60 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.map((report) => (
              <TableRow key={report.id} className="hover:bg-sky-50/60">
                <TableCell className="font-medium text-slate-700">{report.id}</TableCell>
                <TableCell className="text-slate-700">{report.reporterName}</TableCell>
                <TableCell className="text-slate-700">{targetLabels[report.targetType]}</TableCell>
                <TableCell className="text-slate-800">{report.reason}</TableCell>
                <TableCell className="text-center font-semibold text-slate-700">
                  {report.totalReports}
                </TableCell>
                <TableCell>
                  <StatusPill status={report.status} />
                </TableCell>
                <TableCell className="text-slate-600">{formatDate(report.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-sky-200 px-3 text-slate-700 hover:bg-sky-50"
                      onClick={() =>
                        openAction({
                          title: `Xem chi tiết ${report.id}`,
                          description: `${report.reason} (${targetLabels[report.targetType]})`,
                          confirmText: 'Đóng',
                        })
                      }
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-200 bg-amber-50 px-3 text-amber-700 hover:bg-amber-100"
                      onClick={() =>
                        openAction({
                          title: `Ẩn nội dung ${report.targetId}?`,
                          description: 'Nội dung sẽ bị ẩn khỏi bảng tin cho đến khi được khôi phục.',
                          confirmText: 'Ẩn',
                        })
                      }
                    >
                      <Slash className="mr-1 h-4 w-4" />
                      Ẩn
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="px-3"
                      onClick={() =>
                        openAction({
                          title: `Khóa người dùng ${report.reporterId}?`,
                          description: 'Tài khoản sẽ bị khóa cho đến khi được xem xét lại.',
                          confirmText: 'Khóa',
                          confirmVariant: 'destructive',
                        })
                      }
                    >
                      <Ban className="mr-1 h-4 w-4" />
                      Khóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        entityLabel="báo cáo"
        onPageChange={setPage}
      />

      <ConfirmActionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setAction(null);
        }}
        title={action?.title ?? ''}
        description={action?.description}
        confirmText={action?.confirmText}
        confirmVariant={action?.confirmVariant}
        cancelText="Hủy"
        onConfirm={handleConfirm}
      />
    </>
  );
}
