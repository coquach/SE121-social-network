'use client';

import * as React from 'react';
import { Eye, Lock, Unlock, Trash2, Shield, BadgeCheck, Ban, UserCheck } from 'lucide-react';

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

import { SystemRole, SystemUserDTO, UserStatus } from '@/models/user/systemUserDTO';
import { formatDateVN, getFullName } from '@/utils/user.utils';
import { AdminPagination } from '../../_components/pagination';
import { ConfirmActionDialog } from '../../_components/confirm-action-dialog';
import { UserDetailDialog } from './user-detail-dialog';
import { useBanUser, useUnbanUser } from '@/hooks/use-admin-users';
import { Loader } from '@/components/loader-componnet';

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === UserStatus.ACTIVE)
    return (
      <Badge className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        <BadgeCheck className="h-3.5 w-3.5" />
        Hoạt động
      </Badge>
    );

  if (status === UserStatus.BANNED)
    return (
      <Badge className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-50">
        <Ban className="h-3.5 w-3.5" />
        Bị khóa
      </Badge>
    );

  return (
    <Badge className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-100">
      <Trash2 className="h-3.5 w-3.5" />
      Đã xóa
    </Badge>
  );
}

function RoleBadge({ role }: { role: SystemRole }) {
  const roleStyles: Record<SystemRole, { label: string; className: string; icon: React.ReactNode }> = {
    [SystemRole.ADMIN]: {
      label: 'Quản trị',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Shield className="h-3.5 w-3.5" />,
    },
    [SystemRole.MODERATOR]: {
      label: 'Điều hành',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <UserCheck className="h-3.5 w-3.5" />,
    },
    [SystemRole.USER]: {
      label: 'Người dùng',
      className: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: <BadgeCheck className="h-3.5 w-3.5" />,
    },
  };

  const roleStyle = roleStyles[role];

  return (
    <Badge variant="outline" className={`inline-flex items-center gap-1.5 ${roleStyle.className}`}>
      {roleStyle.icon}
      {roleStyle.label}
    </Badge>
  );
}

export type UsersTableProps = {
  users: SystemUserDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

type ActionType = 'ban' | 'unban' | 'delete';

export function UsersTable({ users, page, pageSize, total, loading, onPageChange }: UsersTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [selected, setSelected] = React.useState<SystemUserDTO | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmUser, setConfirmUser] = React.useState<SystemUserDTO | null>(null);
  const [actionType, setActionType] = React.useState<ActionType | null>(null);

  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  const actionLoading = banMutation.isPending || unbanMutation.isPending;
  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const openConfirm = (type: ActionType, user: SystemUserDTO) => {
    setActionType(type);
    setConfirmUser(user);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmUser || !actionType) return;

    try {
      if (actionType === 'ban') {
        await banMutation.mutateAsync(confirmUser.id);
      } else if (actionType === 'unban') {
        await unbanMutation.mutateAsync(confirmUser.id);
      } else {
        // await deleteMutation.mutateAsync(confirmUser.id)
        console.log('TODO delete', confirmUser.id);
      }
    } finally {
      setConfirmOpen(false);
      setConfirmUser(null);
      setActionType(null);
    }
  };

  const confirmTitle = (() => {
    if (!confirmUser || !actionType) return '';
    const name = getFullName(confirmUser) || confirmUser.email;
    if (actionType === 'ban') return `Khóa tài khoản ${name}?`;
    if (actionType === 'unban') return `Mở khóa tài khoản ${name}?`;
    return `Xóa người dùng ${name}?`;
  })();

  const confirmDescription = (() => {
    if (!confirmUser || !actionType) return '';
    if (actionType === 'ban')
      return 'Người dùng sẽ không thể đăng nhập và sử dụng các tính năng cho đến khi được mở khóa.';
    if (actionType === 'unban')
      return 'Người dùng sẽ có thể đăng nhập và hoạt động bình thường trở lại.';
    return 'Hành động này không thể hoàn tác.';
  })();

  const confirmText = actionType === 'delete' ? 'Xóa' : actionType === 'ban' ? 'Khóa' : 'Mở khóa';
  const confirmVariant = actionType === 'delete' ? 'destructive' : 'default';

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-sky-100">
        <Table className="min-w-[720px]">
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>Tên người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[140px]">Vai trò</TableHead>
              <TableHead className="w-[140px]">Ngày tham gia</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-40 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="hover:bg-sky-50/60">
                <TableCell className="font-medium text-slate-700">{u.id}</TableCell>
                <TableCell className="text-slate-800">{getFullName(u)}</TableCell>
                <TableCell className="text-slate-600">{u.email}</TableCell>
                <TableCell className="text-slate-700">
                  <RoleBadge role={u.role} />
                </TableCell>
                <TableCell className="text-slate-600">{formatDateVN(u.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge status={u.status} />
                </TableCell>

                <TableCell className="text-center">
                  <TooltipProvider delayDuration={150}>
                    <div className="inline-flex items-center gap-2">
                      {/* Xem */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-100"
                            onClick={() => setSelected(u)}
                            aria-label="Xem thông tin"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          Xem thông tin
                        </TooltipContent>
                      </Tooltip>

                      {/* Khóa / Mở khóa */}
                      {u.status === UserStatus.BANNED ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-9 w-9 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-100"
                              onClick={() => openConfirm('unban', u)}
                              aria-label="Mở khóa tài khoản"
                              disabled={actionLoading}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            Mở khóa
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-9 w-9 bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-100 hover:bg-rose-100"
                              onClick={() => openConfirm('ban', u)}
                              aria-label="Khóa tài khoản"
                              disabled={u.status === UserStatus.DELETED || actionLoading}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            Khóa tài khoản
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Xóa */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-200"
                            onClick={() => openConfirm('delete', u)}
                            aria-label="Xóa người dùng"
                            disabled={u.status === UserStatus.DELETED || actionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          Xóa người dùng
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}

            {!users.length && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : null}

            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-slate-500">
                  <Loader />
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={pageSize} total={total} entityLabel="người dùng" onPageChange={onPageChange} />

      <UserDetailDialog user={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={(v) => {
          if (!v) {
            setConfirmOpen(false);
            setConfirmUser(null);
            setActionType(null);
          } else setConfirmOpen(true);
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={confirmText}
        cancelText="Hủy"
        confirmVariant={confirmVariant}
        onConfirm={handleConfirm}
      />
    </>
  );
}
