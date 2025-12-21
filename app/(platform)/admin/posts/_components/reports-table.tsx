'use client';

import * as React from 'react';
import { Eye, ShieldAlert, Slash, Ban } from 'lucide-react';

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

const reportsMock = [
  {
    id: 'RP001',
    title: 'Bài đăng có nội dung không phù hợp',
    user: 'Nguyễn Văn A',
    reports: 15,
    severity: 'high' as const,
    reportedAt: '16/01/2024',
    status: 'pending',
  },
  {
    id: 'RP002',
    title: 'Bình luận spam dưới bài viết của nhóm',
    user: 'Trần Thị B',
    reports: 8,
    severity: 'medium' as const,
    reportedAt: '15/01/2024',
    status: 'review',
  },
  {
    id: 'RP003',
    title: 'Ảnh có dấu hiệu bạo lực',
    user: 'Phạm Văn C',
    reports: 5,
    severity: 'high' as const,
    reportedAt: '14/01/2024',
    status: 'hidden',
  },
  {
    id: 'RP004',
    title: 'Video bị tố cáo vi phạm bản quyền',
    user: 'Lê Hoàng D',
    reports: 11,
    severity: 'medium' as const,
    reportedAt: '13/01/2024',
    status: 'pending',
  },
  {
    id: 'RP005',
    title: 'Bài viết chứa ngôn ngữ thù ghét',
    user: 'Đặng Hải E',
    reports: 3,
    severity: 'low' as const,
    reportedAt: '12/01/2024',
    status: 'review',
  },
  {
    id: 'RP006',
    title: 'Livestream quảng cáo sản phẩm giả',
    user: 'Lưu Bích F',
    reports: 9,
    severity: 'high' as const,
    reportedAt: '11/01/2024',
    status: 'pending',
  },
];

type Severity = 'low' | 'medium' | 'high';

type ReportStatus = 'pending' | 'review' | 'hidden';

function SeverityBadge({ level }: { level: Severity }) {
  if (level === 'high')
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">CAO</Badge>
    );
  if (level === 'medium')
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        TRUNG BÌNH
      </Badge>
    );
  return (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      THẤP
    </Badge>
  );
}

function StatusPill({ status }: { status: ReportStatus }) {
  const label =
    status === 'hidden' ? 'ĐÃ ẨN' : status === 'review' ? 'ĐANG XEM XÉT' : 'CHỜ XỬ LÝ';
  const color =
    status === 'hidden'
      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      : status === 'review'
        ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
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

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-sky-100">
        <Table>
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="w-[110px]">Mã báo cáo</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-[180px]">Người dùng</TableHead>
              <TableHead className="w-[120px] text-center">Số lần</TableHead>
              <TableHead className="w-[140px]">Mức độ</TableHead>
              <TableHead className="w-[140px]">Trạng thái</TableHead>
              <TableHead className="w-[150px]">Ngày báo cáo</TableHead>
              <TableHead className="w-48 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.map((report) => (
              <TableRow key={report.id} className="hover:bg-sky-50/60">
                <TableCell className="font-medium text-slate-700">
                  {report.id}
                </TableCell>
                <TableCell className="text-slate-800">{report.title}</TableCell>
                <TableCell className="text-slate-700">{report.user}</TableCell>
                <TableCell className="text-center font-semibold text-slate-700">
                  {report.reports}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <SeverityBadge level={report.severity} />
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                  </div>
                </TableCell>
                <TableCell>
                  <StatusPill status={report.status} />
                </TableCell>
                <TableCell className="text-slate-600">{report.reportedAt}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-sky-200 px-3 text-slate-700 hover:bg-sky-50"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-200 bg-amber-50 px-3 text-amber-700 hover:bg-amber-100"
                    >
                      <Slash className="mr-1 h-4 w-4" />
                      Ẩn
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="px-3"
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
    </>
  );
}
