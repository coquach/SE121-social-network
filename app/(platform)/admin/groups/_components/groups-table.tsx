'use client';

import * as React from 'react';
import { Eye, Pause, Play, ShieldAlert, Trash2, Users } from 'lucide-react';

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
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { GroupDTO } from '@/models/group/groupDTO';
import { ConfirmActionDialog } from '../../_components/confirm-action-dialog';
import { AdminPagination } from '../../_components/pagination';

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

type AdminGroup = GroupDTO & {
  category: string;
  ownerName: string;
  pendingReports: number;
};

type ActionState = {
  title: string;
  description?: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm?: () => void;
};

const groupsMock: AdminGroup[] = [
  {
    id: 'GR-201',
    name: 'Nhiếp ảnh & Du lịch',
    ownerName: 'Thu Hà',
    privacy: GroupPrivacy.PUBLIC,
    members: 18240,
    pendingReports: 3,
    status: GroupStatus.ACTIVE,
    createdAt: new Date('2023-08-12'),
    category: 'Sở thích',
    avatarUrl: '',
    coverImageUrl: '',
  },
  {
    id: 'GR-178',
    name: 'Developer Việt Nam',
    ownerName: 'Nguyễn Minh',
    privacy: GroupPrivacy.PRIVATE,
    members: 9800,
    pendingReports: 0,
    status: GroupStatus.ACTIVE,
    createdAt: new Date('2023-05-02'),
    category: 'Công việc',
    avatarUrl: '',
    coverImageUrl: '',
  },
  {
    id: 'GR-099',
    name: 'Chợ Đồ Cũ Hà Nội',
    ownerName: 'Lan Anh',
    privacy: GroupPrivacy.PUBLIC,
    members: 45210,
    pendingReports: 12,
    status: GroupStatus.BANNED,
    createdAt: new Date('2022-11-19'),
    category: 'Mua bán',
    avatarUrl: '',
    coverImageUrl: '',
  },
  {
    id: 'GR-310',
    name: 'Tối giản sống xanh',
    ownerName: 'Quang Huy',
    privacy: GroupPrivacy.PRIVATE,
    members: 640,
    pendingReports: 1,
    status: GroupStatus.INACTIVE,
    createdAt: new Date('2024-01-05'),
    category: 'Lối sống',
    avatarUrl: '',
    coverImageUrl: '',
  },
  {
    id: 'GR-257',
    name: 'Cộng đồng chạy bộ sáng',
    ownerName: 'Bảo Trân',
    privacy: GroupPrivacy.PUBLIC,
    members: 7120,
    pendingReports: 0,
    status: GroupStatus.ACTIVE,
    createdAt: new Date('2023-02-15'),
    category: 'Sức khỏe',
    avatarUrl: '',
    coverImageUrl: '',
  },
  {
    id: 'GR-411',
    name: 'Tuyển dụng IT mỗi ngày',
    ownerName: 'TechWorks',
    privacy: GroupPrivacy.PRIVATE,
    members: 15230,
    pendingReports: 5,
    status: GroupStatus.BANNED,
    createdAt: new Date('2022-12-01'),
    category: 'Công việc',
    avatarUrl: '',
    coverImageUrl: '',
  },
];

function StatusBadge({ status }: { status: GroupStatus }) {
  if (status === GroupStatus.ACTIVE)
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Hoạt động</Badge>
    );

  if (status === GroupStatus.INACTIVE)
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Tạm dừng</Badge>;

  if (status === GroupStatus.BANNED)
    return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Bị hạn chế</Badge>;

  return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Đã xóa</Badge>;
}

function PrivacyBadge({ privacy }: { privacy: GroupPrivacy }) {
  const label = privacy === GroupPrivacy.PUBLIC ? 'Công khai' : 'Riêng tư';

  return (
    <Badge
      variant="secondary"
      className="border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50"
    >
      {label}
    </Badge>
  );
}

export function GroupsTable() {
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const total = groupsMock.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = groupsMock.slice(start, start + pageSize);

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
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[180px]">Tên nhóm</TableHead>
              <TableHead className="w-[140px]">Người tạo</TableHead>
              <TableHead className="w-[130px]">Quyền riêng tư</TableHead>
              <TableHead className="w-[120px]">Thành viên</TableHead>
              <TableHead className="w-[120px]">Báo cáo chờ</TableHead>
              <TableHead className="w-[140px]">Ngày tạo</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-52 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.map((g) => (
              <TableRow key={g.id} className="hover:bg-sky-50/60">
                <TableCell className="font-medium text-slate-700">{g.id}</TableCell>
                <TableCell className="space-y-1">
                  <div className="font-medium text-slate-800">{g.name}</div>
                  <div className="text-xs text-slate-500">Danh mục: {g.category}</div>
                </TableCell>
                <TableCell className="text-slate-700">{g.ownerName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <PrivacyBadge privacy={g.privacy} />
                  </div>
                </TableCell>
                <TableCell className="text-slate-700">
                  <div className="inline-flex items-center gap-1 font-medium">
                    <Users className="h-4 w-4 text-slate-500" />
                    {g.members.toLocaleString('vi-VN')}
                  </div>
                </TableCell>
                <TableCell className="text-slate-700">{g.pendingReports} báo cáo</TableCell>
                <TableCell className="text-slate-600">{formatDate(g.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge status={g.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-sky-200 hover:bg-sky-50"
                      onClick={() =>
                        openAction({
                          title: `Xem chi tiết ${g.name}`,
                          description: `Nhóm do ${g.ownerName} tạo, quyền ${
                            g.privacy === GroupPrivacy.PUBLIC ? 'công khai' : 'riêng tư'
                          }`,
                          confirmText: 'Đóng',
                        })
                      }
                      aria-label={`Xem chi tiết ${g.name}`}
                    >
                      <Eye className="h-4 w-4 text-sky-700" />
                    </Button>

                    {g.status === GroupStatus.INACTIVE ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-sky-200 hover:bg-sky-50"
                        onClick={() =>
                          openAction({
                            title: `Mở lại nhóm ${g.name}?`,
                            description: 'Nhóm sẽ hoạt động trở lại và cho phép thành viên tương tác.',
                          })
                        }
                        aria-label={`Mở lại nhóm ${g.name}`}
                      >
                        <Play className="h-4 w-4 text-emerald-700" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-sky-200 hover:bg-sky-50"
                        onClick={() =>
                          openAction({
                            title: `Tạm dừng nhóm ${g.name}?`,
                            description: 'Nhóm sẽ tạm thời không cho phép đăng bài và tương tác mới.',
                            confirmText: 'Tạm dừng',
                          })
                        }
                        aria-label={`Tạm dừng nhóm ${g.name}`}
                      >
                        <Pause className="h-4 w-4 text-amber-700" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="border-rose-200 hover:bg-rose-50"
                      onClick={() =>
                        openAction({
                          title: `Gắn cờ nhóm ${g.name}?`,
                          description: 'Nhóm sẽ được thêm vào danh sách ưu tiên kiểm duyệt.',
                          confirmText: 'Đánh dấu',
                        })
                      }
                      aria-label={`Đánh dấu cần kiểm duyệt ${g.name}`}
                    >
                      <ShieldAlert className="h-4 w-4 text-rose-600" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-200 hover:bg-slate-50"
                      onClick={() =>
                        openAction({
                          title: `Xóa nhóm ${g.name}?`,
                          description: 'Hành động này sẽ ẩn toàn bộ nội dung và không thể hoàn tác.',
                          confirmText: 'Xóa',
                          confirmVariant: 'destructive',
                        })
                      }
                      aria-label={`Xóa nhóm ${g.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-slate-700" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-slate-500">
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
        entityLabel="nhóm"
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
