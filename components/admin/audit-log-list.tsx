import { CalendarClock, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuditLogResponseDTO } from '@/models/log/logDTO';

type AuditLogListProps = {
  title: string;
  description?: string;
  logs: AuditLogResponseDTO[];
  loading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyHint?: string;
};

const formatDateTime = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString('vi-VN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function AuditLogList({
  title,
  description,
  logs,
  loading,
  isFetchingMore,
  hasMore,
  onLoadMore,
  emptyHint = 'Chưa có log hoạt động',
}: AuditLogListProps) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
          <Shield className="mr-1 h-4 w-4" />
          Audit log
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-sm text-slate-500">
          Đang tải log hoạt động...
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          {emptyHint}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-1 gap-3">
                <div className="mt-1 rounded-full bg-sky-50 p-2">
                  <Shield className="h-4 w-4 text-sky-600" aria-hidden />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                    <p className="text-sm text-slate-600">{log.detail}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Người thực hiện: {log.actorId}</span>
                    <span className="text-slate-300">•</span>
                    <span>Mục tiêu: {log.targetId}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100">
                      #{log.id}
                    </Badge>
                    <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                      {log.logType}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarClock className="h-4 w-4" aria-hidden />
                <span>{formatDateTime(log.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={isFetchingMore}>
            {isFetchingMore ? 'Đang tải thêm...' : 'Tải thêm log'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
