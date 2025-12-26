'use client';
import { GroupLogDTO } from "@/models/group/groupLogDTO";

import { format } from "date-fns";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EVENT_BADGE_COLOR, EVENT_LABEL } from "./admin-logs-section";

type LogRowProps = {
  log: GroupLogDTO;
};

export const LogRow = ({ log }: LogRowProps) => {
  const label =
    EVENT_LABEL[log.eventType] ??
    log.eventType?.toString()?.replace(/_/g, ' ')?.toLowerCase();

  const badgeClass =
    EVENT_BADGE_COLOR[log.eventType] ??
    'bg-slate-50 text-slate-600 border-slate-200';

  const createdAt = log.createdAt
    ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')
    : '';

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
      {/* left: user + content */}
      <div className="flex items-start gap-3 min-w-0">
        <Avatar userId={log.userId} showName showStatus />

        <div className="space-y-1 min-w-0">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{label}</span>
          </p>
          <p className="text-sm text-slate-800 whitespace-pre-wrap wrap-break-word">
            {log.content || 'Không có thêm chi tiết.'}
          </p>
          {createdAt && (
            <p className="text-[11px] text-slate-400">
              Thời gian:{' '}
              <span className="font-medium text-slate-600">{createdAt}</span>
            </p>
          )}
        </div>
      </div>

      {/* right: type badge */}
      <div className="flex items-start justify-end sm:ml-3">
        <Badge
          variant="outline"
          className={cn(
            'border text-[11px] px-2 py-0.5 rounded-full',
            badgeClass
          )}
        >
          {log.eventType.replace(/_/g, ' ')}
        </Badge>
      </div>
    </div>
  );
};
