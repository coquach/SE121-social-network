'use client';

import * as React from 'react';
import { Eye, Lock, Unlock, Trash2 } from 'lucide-react';

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
import { SystemUserDTO, UserStatus } from '@/models/user/systemUserDTO';
import { formatDateVN, getFullName } from '@/utils/user.utils';
import { AdminPagination } from '../../_components/pagination';
import { ConfirmActionDialog } from '../../_components/confirm-action-dialog';
import { UserDetailDialog } from './user-detail-dialog';

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === UserStatus.ACTIVE)
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        HOẠT ĐỘNG
      </Badge>
    );

  if (status === UserStatus.BANNED)
    return (
      <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100">
        BỊ KHÓA
      </Badge>
    );

  return (
    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
      ĐÃ XÓA
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

  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const openConfirm = (type: ActionType, user: SystemUserDTO) => {
    setActionType(type);
    setConfirmUser(user);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!confirmUser || !actionType) return;
    console.log('CONFIRM', actionType, confirmUser.id); // TODO: API integration

    setConfirmOpen(false);
    setConfirmUser(null);
    setActionType(null);
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
              <TableHead className="w-[120px]">Vai trò</TableHead>
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
                <TableCell className="text-slate-600 capitalize">{u.role}</TableCell>
                <TableCell className="text-slate-600">{formatDateVN(u.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge status={u.status} />
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-sky-200 hover:bg-sky-50"
                      onClick={() => setSelected(u)}
                      aria-label="Xem thông tin"
                    >
                      <Eye className="h-4 w-4 text-sky-700" />
                    </Button>

                    {u.status === UserStatus.BANNED ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-sky-200 hover:bg-sky-50"
                        onClick={() => openConfirm('unban', u)}
                        aria-label="Mở khóa tài khoản"
                      >
                        <Unlock className="h-4 w-4 text-slate-700" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-sky-200 hover:bg-sky-50"
                        onClick={() => openConfirm('ban', u)}
                        aria-label="Khóa tài khoản"
                        disabled={u.status === UserStatus.DELETED}
                      >
                        <Lock className="h-4 w-4 text-slate-700" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="border-sky-200 hover:bg-sky-50"
                      onClick={() => openConfirm('delete', u)}
                      aria-label="Xóa người dùng"
                      disabled={u.status === UserStatus.DELETED}
                    >
                      <Trash2 className="h-4 w-4 text-slate-700" />
                    </Button>
                  </div>
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
        entityLabel="người dùng"
        onPageChange={onPageChange}
      />

      <UserDetailDialog
        user={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />

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
