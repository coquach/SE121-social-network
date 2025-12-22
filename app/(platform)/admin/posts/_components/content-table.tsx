'use client';

import * as React from 'react';

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

import { Eye, ListChecks } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { ContentEntryDTO } from '@/models/social/post/contentEntryDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { formatDateVN } from '@/utils/user.utils';
import { AdminPagination } from '../../_components/pagination';
import { ContentDetailDialog } from './content-detail-dialog';
import { ContentReportsDialog } from './content-reports-dialog';
import { Loader } from '@/components/loader-componnet';

type ContentTableProps = {
  entries: ContentEntryDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

const targetLabels: Record<TargetType, string> = {
  [TargetType.POST]: 'Bài viết',
  [TargetType.SHARE]: 'Chia sẻ',
  [TargetType.COMMENT]: 'Bình luận',
};

const targetClassName: Record<TargetType, string> = {
  [TargetType.POST]: 'bg-sky-50 text-sky-700 hover:bg-sky-50',
  [TargetType.SHARE]: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50',
  [TargetType.COMMENT]: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
};

const formatContent = (content: string) => {
  if (!content) return 'Không có nội dung';
  if (content.length <= 120) return content;
  return `${content.slice(0, 120)}...`;
};

export function ContentTable({
  entries,
  page,
  pageSize,
  total,
  loading,
  onPageChange,
}: ContentTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [selected, setSelected] = React.useState<ContentEntryDTO | null>(null);
  const [reportEntry, setReportEntry] = React.useState<ContentEntryDTO | null>(
    null
  );

  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-sky-100">
        <Table className="min-w-[960px]">
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="w-[90px] text-center">ID</TableHead>
              <TableHead className="w-[140px] text-center">Loại</TableHead>
              <TableHead className="text-center">Nội dung</TableHead>
              <TableHead className="w-[120px] text-center">Báo cáo</TableHead>
              <TableHead className="w-40 text-center">Ngày tạo</TableHead>
              <TableHead className="w-56 text-center ">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-sky-50/60">
                <TableCell className="font-medium text-slate-700">
                  {entry.id}
                </TableCell>
                <TableCell className="flex items-center justify-center">
                  <Badge className={targetClassName[entry.type]}>
                    {targetLabels[entry.type]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[360px] text-slate-800">
                  <p className="line-clamp-2 whitespace-pre-line text-sm leading-relaxed">
                    {formatContent(entry.content)}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50">
                    {entry.reportCount ?? 0} lần
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatDateVN(entry.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <TooltipProvider delayDuration={150}>
                    <div className="inline-flex items-center justify-center gap-2">
                      {/* Xem chi tiết */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-100"
                            onClick={() => setSelected(entry)}
                            aria-label="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          Xem chi tiết
                        </TooltipContent>
                      </Tooltip>

                      {/* Báo cáo */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-100 hover:bg-amber-100"
                            onClick={() => setReportEntry(entry)}
                            aria-label="Xem báo cáo"
                          >
                            <ListChecks className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          Xem báo cáo
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}

            {!entries.length && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-slate-500"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : null}

            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-slate-500"
                >
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
        entityLabel="nội dung"
        onPageChange={onPageChange}
      />

      <ContentDetailDialog
        entry={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
      <ContentReportsDialog
        entryId={reportEntry?.id}
        targetType={reportEntry?.type}
        open={!!reportEntry}
        onOpenChange={(open) => {
          if (!open) setReportEntry(null);
        }}
      />
    </>
  );
}
