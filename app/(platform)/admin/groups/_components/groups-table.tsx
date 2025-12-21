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
import { AdminPagination } from '../../_components/pagination';

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

type GroupStatus = 'active' | 'paused' | 'flagged';

type GroupRow = {
  id: string;
  name: string;
  owner: string;
  visibility: 'public' | 'private' | 'hidden';
  members: number;
  pendingReports: number;
  status: GroupStatus;
  createdAt: Date;
  category: string;
};

const groupsMock: GroupRow[] = [
  {
    id: 'GR-201',
    name: 'Nhiếp ảnh & Du lịch',
    owner: 'Thu Hà',
    visibility: 'public',
    members: 18240,
    pendingReports: 3,
    status: 'active',
    createdAt: new Date('2023-08-12'),
    category: 'Sở thích',
  },
  {
    id: 'GR-178',
    name: 'Developer Việt Nam',
    owner: 'Nguyễn Minh',
    visibility: 'private',
    members: 9800,
    pendingReports: 0,
    status: 'active',
    createdAt: new Date('2023-05-02'),
    category: 'Công việc',
  },
  {
    id: 'GR-099',
    name: 'Chợ Đồ Cũ Hà Nội',
    owner: 'Lan Anh',
    visibility: 'public',
    members: 45210,
    pendingReports: 12,
    status: 'flagged',
    createdAt: new Date('2022-11-19'),
    category: 'Mua bán',
  },
  {
    id: 'GR-310',
    name: 'Tối giản sống xanh',
    owner: 'Quang Huy',
    visibility: 'hidden',
    members: 640,
    pendingReports: 1,
    status: 'paused',
    createdAt: new Date('2024-01-05'),
    category: 'Lối sống',
  },
  {
    id: 'GR-257',
    name: 'Cộng đồng chạy bộ sáng',
    owner: 'Bảo Trân',
    visibility: 'public',
    members: 7120,
    pendingReports: 0,
    status: 'active',
    createdAt: new Date('2023-02-15'),
    category: 'Sức khỏe',
  },
  {
    id: 'GR-411',
    name: 'Tuyển dụng IT mỗi ngày',
    owner: 'TechWorks',
    visibility: 'private',
    members: 15230,
    pendingReports: 5,
    status: 'flagged',
    createdAt: new Date('2022-12-01'),
    category: 'Công việc',
  },
];

function StatusBadge({ status }: { status: GroupStatus }) {
  if (status === 'active')
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Hoạt động</Badge>
    );

  if (status === 'paused')
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Tạm dừng</Badge>;

  return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Đang bị báo cáo</Badge>;
}

function VisibilityBadge({ visibility }: { visibility: GroupRow['visibility'] }) {
  const label =
    visibility === 'public' ? 'Công khai' : visibility === 'private' ? 'Riêng tư' : 'Ẩn';
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

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-sky-100">
        <Table>
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Tên nhóm</TableHead>
              <TableHead className="w-[110px]">Loại</TableHead>
              <TableHead className="w-[120px]">Thành viên</TableHead>
              <TableHead className="w-[120px]">Báo cáo chờ</TableHead>
              <TableHead className="w-[140px]">Ngày tạo</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-48 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.map((g) => (
              <TableRow key={g.id} className="hover:bg-sky-50/60">
                <TableCell className="font-medium text-slate-700">{g.id}</TableCell>
                <TableCell className="space-y-1">
                  <div className="font-medium text-slate-800">{g.name}</div>
                  <div className="text-xs text-slate-500">Người tạo: {g.owner}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <VisibilityBadge visibility={g.visibility} />
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                      {g.category}
                    </span>
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
                      aria-label={`Xem chi tiết ${g.name}`}
                    >
                      <Eye className="h-4 w-4 text-sky-700" />
                    </Button>

                    {g.status === 'paused' ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-sky-200 hover:bg-sky-50"
                        aria-label={`Mở lại nhóm ${g.name}`}
                      >
                        <Play className="h-4 w-4 text-emerald-700" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-sky-200 hover:bg-sky-50"
                        aria-label={`Tạm dừng nhóm ${g.name}`}
                      >
                        <Pause className="h-4 w-4 text-amber-700" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="border-rose-200 hover:bg-rose-50"
                      aria-label={`Đánh dấu cần kiểm duyệt ${g.name}`}
                    >
                      <ShieldAlert className="h-4 w-4 text-rose-600" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-200 hover:bg-slate-50"
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
        entityLabel="nhóm"
        onPageChange={setPage}
      />
    </>
  );
}
