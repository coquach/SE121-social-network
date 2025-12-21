'use client';

import * as React from 'react';
import { Eye, Lock, Unlock, Trash2 } from 'lucide-react';
import type { UserDTO } from '@/models/user/userDTO';



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


import { formatDateVN, getFullName } from '@/utils/user.utils';
import { ConfirmActionDialog } from './confirm-action-dialog';
import { UserDetailDialog } from './user-detail-dialog';
import { UsersPagination } from './pagination';


function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      HOẠT ĐỘNG
    </Badge>
  ) : (
    <Badge
      variant="secondary"
      className="bg-slate-100 text-slate-600 hover:bg-slate-100"
    >
      BỊ KHÓA
    </Badge>
  );
}

type ActionType = 'ban' | 'unban' | 'delete';

const usersMock: UserDTO[] = [
  {
    id: 'U001',
    email: 'nguyenvana@gmail.com',
    isActive: true,
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    coverImageUrl: '',
    avatarUrl: 'https://i.pravatar.cc/120?img=12',
    bio: 'Thích chia sẻ cảm xúc tích cực mỗi ngày.',
    createdAt: new Date('2024-01-15'),
    relation: { status: 'BẠN BÈ' },
  },
  {
    id: 'U002',
    email: 'tranthib@gmail.com',
    isActive: false,
    firstName: 'Trần',
    lastName: 'Thị B',
    coverImageUrl: '',
    avatarUrl: 'https://i.pravatar.cc/120?img=32',
    bio: 'Đang tạm nghỉ hoạt động.',
    createdAt: new Date('2024-01-12'),
    relation: { status: 'THEO DÕI' },
  },
  {
    id: 'U003',
    email: 'levanc@gmail.com',
    isActive: true,
    firstName: 'Lê',
    lastName: 'Văn C',
    coverImageUrl: '',
    avatarUrl: 'https://i.pravatar.cc/120?img=52',
    bio: 'Yêu thích những bài đăng truyền cảm hứng.',
    createdAt: new Date('2024-01-10'),
    relation: { status: 'CHỜ DUYỆT' },
  },
];

export function UsersTable() {
  // pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const total = usersMock.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    // nếu total thay đổi làm page vượt quá => kéo về
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = usersMock.slice(start, start + pageSize);

  // dialogs
  const [selected, setSelected] = React.useState<UserDTO | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmUser, setConfirmUser] = React.useState<UserDTO | null>(null);
  const [actionType, setActionType] = React.useState<ActionType | null>(null);

  const openConfirm = (type: ActionType, user: UserDTO) => {
    setActionType(type);
    setConfirmUser(user);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!confirmUser || !actionType) return;
    console.log('CONFIRM', actionType, confirmUser.id); // TODO API

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

  const confirmText =
    actionType === 'delete' ? 'Xóa' : actionType === 'ban' ? 'Khóa' : 'Mở khóa';
  const confirmVariant = actionType === 'delete' ? 'destructive' : 'default';

  return (
    <>
      <div className="rounded-xl border border-sky-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>Tên người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[140px]">Ngày tham gia</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-40 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.map((u) => (
              <TableRow key={u.id} className="hover:bg-sky-50/60">
                <TableCell className="font-medium text-slate-700">
                  {u.id}
                </TableCell>
                <TableCell className="text-slate-800">
                  {getFullName(u)}
                </TableCell>
                <TableCell className="text-slate-600">{u.email}</TableCell>
                <TableCell className="text-slate-600">
                  {formatDateVN(u.createdAt)}
                </TableCell>
                <TableCell>
                  <StatusBadge active={u.isActive} />
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

                    {u.isActive ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-sky-200 hover:bg-sky-50"
                        onClick={() => openConfirm('ban', u)}
                        aria-label="Khóa tài khoản"
                      >
                        <Lock className="h-4 w-4 text-slate-700" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-sky-200 hover:bg-sky-50"
                        onClick={() => openConfirm('unban', u)}
                        aria-label="Mở khóa tài khoản"
                      >
                        <Unlock className="h-4 w-4 text-slate-700" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="border-sky-200 hover:bg-sky-50"
                      onClick={() => openConfirm('delete', u)}
                      aria-label="Xóa người dùng"
                    >
                      <Trash2 className="h-4 w-4 text-slate-700" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-slate-500"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <UsersPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
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