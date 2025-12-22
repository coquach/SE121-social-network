import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReportDTO, ReportStatus } from "@/models/report/reportDTO";
import { formatDateVN } from "@/utils/user.utils";
import { Ban, CheckCircle2, Loader2 } from "lucide-react";

const statusMeta: Record<ReportStatus, { label: string; className: string }> = {
  [ReportStatus.PENDING]: {
    label: 'Chờ',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  [ReportStatus.RESOLVED]: {
    label: 'Xử lý',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  [ReportStatus.REJECTED]: {
    label: 'Từ chối',
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
};
export function ReportCard({
  report,
  onResolveTarget,
  onReject,
  resolving,
  rejecting,
}: {
  report: ReportDTO;
  onResolveTarget: () => void;
  onReject: (reportId: string) => void;
  resolving: boolean;
  rejecting: boolean;
}) {
  const meta = statusMeta[report.status];
  const isPending = report.status === ReportStatus.PENDING;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50">
              {report.targetType}
            </Badge>
            <Badge variant="secondary" className={meta.className}>
              {meta.label}
            </Badge>
            <span className="text-xs text-slate-400">#{report.id}</span>
          </div>

          <div className="mt-2 line-clamp-2 text-sm text-slate-700">
            {report.reason || '—'}
          </div>

          <div className="mt-2 text-xs text-slate-500">
            {formatDateVN(report.createdAt)}
          </div>
        </div>

        {isPending ? (
          <TooltipProvider delayDuration={120}>
            <div className="flex shrink-0 items-center gap-2">
              {/* Resolve */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
                    onClick={onResolveTarget}
                    disabled={resolving}
                    aria-label="Đánh dấu xử lý"
                  >
                    {resolving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Đánh dấu xử lý</TooltipContent>
              </Tooltip>

              {/* Reject */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 bg-rose-50 text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
                    onClick={() => onReject(report.id)}
                    disabled={rejecting}
                    aria-label="Từ chối"
                  >
                    {rejecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Từ chối</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : null}
      </div>
    </div>
  );
}
