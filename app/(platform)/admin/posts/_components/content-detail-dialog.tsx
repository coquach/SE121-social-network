'use client';

import React from 'react';
import { FileText, MessageSquare, Video } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ContentEntryDTO } from '@/models/social/post/contentEntryDTO';
import { MediaType, TargetType } from '@/models/social/enums/social.enum';
import { formatDateVN } from '@/utils/user.utils';

const targetLabels: Record<TargetType, { label: string; className: string }> = {
  [TargetType.POST]: { label: 'Bài viết', className: 'bg-sky-100 text-sky-700' },
  [TargetType.SHARE]: { label: 'Chia sẻ', className: 'bg-indigo-100 text-indigo-700' },
  [TargetType.COMMENT]: { label: 'Bình luận', className: 'bg-emerald-100 text-emerald-700' },
};

type ContentDetailDialogProps = {
  entry: ContentEntryDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContentDetailDialog({ entry, open, onOpenChange }: ContentDetailDialogProps) {
  if (!entry) return null;

  const typeMeta = targetLabels[entry.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] border-sky-100">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Chi tiết nội dung</DialogTitle>
          <DialogDescription>
            Thông tin nhanh về nội dung bị báo cáo và các thông số liên quan
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={typeMeta.className}>{typeMeta.label}</Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
              #{entry.id}
            </Badge>
            <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50">
              {entry.reportCount} báo cáo
            </Badge>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FileText className="h-4 w-4" />
              Nội dung gốc
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {entry.content || 'Nội dung trống'}
            </p>

            {entry.medias?.length ? (
              <div className="mt-3 space-y-3">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Media đính kèm
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {entry.medias.map((media, idx) => (
                    <div
                      key={media.publicId || `${media.url}-${idx}`}
                      className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {media.type === MediaType.IMAGE ? 'Hình ảnh' : 'Video'}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-50"
                        >
                          #{idx + 1}
                        </Badge>
                      </div>
                      <div className="mt-2 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                        {media.type === MediaType.VIDEO ? (
                          <video src={media.url} controls className="h-56 w-full bg-black object-contain">
                            <track kind="captions" />
                          </video>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.url}
                            alt={`Media ${idx + 1}`}
                            className="h-56 w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2 truncate text-xs text-slate-500">
                        {media.type === MediaType.VIDEO ? <Video className="h-3.5 w-3.5" /> : null}
                        <span className="truncate">{media.url}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-xs font-medium text-slate-500">Loại nội dung</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{typeMeta.label}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-xs font-medium text-slate-500">Ngày tạo</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">
                {formatDateVN(entry.createdAt)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-center gap-2 font-semibold">
              <MessageSquare className="h-4 w-4" />
              Ghi chú
            </div>
            <p className="mt-1 text-amber-900">
              Hãy xem báo cáo chi tiết để quyết định có ẩn nội dung, khóa tài khoản đăng tải hoặc bỏ
              qua.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
