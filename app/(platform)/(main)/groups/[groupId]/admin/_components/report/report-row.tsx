'use client';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { GroupReportDTO } from '@/models/group/groupReportDTO';
import { Avatar } from '@/components/avatar';

type RowProps = {
  report: GroupReportDTO;
};

const ReportRow = ({ report }: RowProps) => {
  const createdAt = report.createdAt
    ? format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')
    : null;

  // map status từ string
  const statusLabel = (() => {
    switch (report.status) {
      case 'PENDING':
        return 'Đang chờ xử lý';
      case 'RESOLVED':
        return 'Đã xử lý';
      case 'DISMISSED':
        return 'Đã bỏ qua';
      default:
        return report.status || 'Không rõ';
    }
  })();

  const statusColor =
    report.status === 'PENDING'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : report.status === 'RESOLVED'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : report.status === 'DISMISSED'
      ? 'bg-slate-50 text-slate-600 border-slate-200'
      : 'bg-slate-50 text-slate-600 border-slate-200';

  // map target type -> label cho dễ đọc
  const targetLabel = (() => {
    switch (report.targetType) {
      case 'POST':
        return 'bài viết';
      case 'COMMENT':
        return 'bình luận';
      case 'GROUP_MEMBER':
        return 'thành viên';
      default:
        return report.targetType?.toLowerCase?.() || 'mục tiêu';
    }
  })();

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3  px-3 py-3">
      <div className="flex items-start gap-3 min-w-0">
        {/* Người báo cáo */}
        <Avatar userId={report.reporterId} showName showStatus />

        <div className="space-y-1 min-w-0">
          <p className="text-xs text-sky-600/90">
            Báo cáo <span className="font-semibold">{targetLabel}</span> (ID:{' '}
            <span className="font-mono text-[11px] text-slate-600">
              {report.id}
            </span>
            )
          </p>

          <p className="text-sm text-slate-800 wrap-break-word whitespace-pre-wrap">
            {report.reason || 'Không có nội dung báo cáo.'}
          </p>

          {createdAt && (
            <p className="text-xs text-slate-400">
              Gửi lúc <span className="font-medium">{createdAt}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <Badge
          variant="outline"
          className={`border text-[11px] px-2 py-0.5 rounded-full ${statusColor}`}
        >
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
};
export default ReportRow;
