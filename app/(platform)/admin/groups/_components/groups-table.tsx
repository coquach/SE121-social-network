'use client';

import * as React from 'react';
import { Eye, ListChecks, Lock, Trash2, Unlock } from 'lucide-react';

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { formatDateVN } from '@/utils/user.utils';
import { Loader } from '@/components/loader-componnet';
import { ConfirmActionDialog } from '../../_components/confirm-action-dialog';
import { AdminPagination } from '../../_components/pagination';

const privacyLabel: Record<GroupPrivacy, string> = {
  [GroupPrivacy.PUBLIC]: 'Công khai',
  [GroupPrivacy.PRIVATE]: 'Riêng tư',
};

type ActionState = {
  title: string;
  description?: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm?: () => void;
};

type GroupsTableProps = {
  groups: AdminGroupDTO[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onViewReports: (group: AdminGroupDTO) => void;
  onViewDetail: (group: AdminGroupDTO) => void;
  onBanGroup?: (group: AdminGroupDTO) => void;
  onUnbanGroup?: (group: AdminGroupDTO) => void;
};

function StatusBadge({ status }: { status?: GroupStatus }) {
  if (status === GroupStatus.BANNED)
    return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Bị hạn chế</Badge>;

  if (status === GroupStatus.INACTIVE)
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Tạm dừng</Badge>;

  return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Hoạt động</Badge>;
}

function PrivacyBadge({ privacy }: { privacy: GroupPrivacy }) {
  const label = privacyLabel[privacy];

  return (
    <Badge
      variant="secondary"
      className="border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50"
    >
      {label}
    </Badge>
  );
}

export function GroupsTable({
  groups,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onViewReports,
  onViewDetail,
  onBanGroup,
  onUnbanGroup,
}: GroupsTableProps) {
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

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="overflow-x-auto rounded-xl border border-sky-100">
        <Table className="min-w-[960px]">
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="w-20">Mã nhóm</TableHead>
              <TableHead className="w-[220px]">Tên nhóm</TableHead>
              <TableHead className="w-[140px]">Chế độ</TableHead>
              <TableHead className="w-[120px]">Thành viên</TableHead>
              <TableHead className="w-[140px]">Báo cáo</TableHead>
              <TableHead className="w-[140px]">Ngày tạo</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-52 text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id} className="hover:bg-sky-50/60">
                <TableCell className="font-medium text-slate-700">{group.id}</TableCell>
                <TableCell className="space-y-1">
                  <div className="font-medium text-slate-800">{group.name}</div>
                </TableCell>
                <TableCell>
                  <PrivacyBadge privacy={group.privacy} />
                </TableCell>
                <TableCell className="text-slate-700">
                  <div className="font-medium">{group.members.toLocaleString('vi-VN')}</div>
                </TableCell>
                <TableCell className="text-slate-700">
                  <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50">{group.reports} báo cáo</Badge>
                </TableCell>
                <TableCell className="text-slate-600">{formatDateVN(group.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge status={group.status} />
                </TableCell>

                <TableCell className="text-center">
                  <div className="inline-flex items-center justify-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-9 w-9 bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-100"
                          onClick={() => onViewDetail(group)}
                          aria-label={`Xem chi tiết ${group.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        Xem chi tiết
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-9 w-9 bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-100 hover:bg-amber-100"
                          onClick={() => onViewReports(group)}
                          aria-label={`Xem báo cáo của ${group.name}`}
                        >
                          <ListChecks className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        Xem báo cáo
                      </TooltipContent>
                    </Tooltip>

                    {group.status === GroupStatus.BANNED ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-100"
                            onClick={() =>
                              openAction({
                                title: `Bỏ hạn chế ${group.name}?`,
                                description: 'Nhóm sẽ hoạt động trở lại bình thường.',
                                confirmText: 'Bỏ hạn chế',
                                onConfirm: () => onUnbanGroup?.(group),
                              })
                            }
                            aria-label={`Bỏ hạn chế ${group.name}`}
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          Bỏ hạn chế
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-100 hover:bg-rose-100"
                            onClick={() =>
                              openAction({
                                title: `Hạn chế ${group.name}?`,
                                description: 'Nhóm sẽ bị hạn chế và cần xem xét lại.',
                                confirmText: 'Hạn chế',
                                confirmVariant: 'destructive',
                                onConfirm: () => onBanGroup?.(group),
                              })
                            }
                            aria-label={`Hạn chế ${group.name}`}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          Hạn chế
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-9 w-9 bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-200"
                          aria-label={`Xóa nhóm ${group.name}`}
                          onClick={() =>
                            openAction({
                              title: `Xóa nhóm ${group.name}?`,
                              description: 'Hành động này sẽ xóa toàn bộ nội dung và không thể hoàn tác.',
                              confirmText: 'Xóa',
                              confirmVariant: 'destructive',
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        Xóa nhóm
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!groups.length && !loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : null}

            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-slate-500">
                  <Loader />
                  Đang tải dữ liệu...
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
        onPageChange={onPageChange}
        entityLabel="nhóm"
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
    </TooltipProvider>
  );
}
