'use client';

import type { UserDTO } from '@/models/user/userDTO';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateVN, getFullName } from '@/utils/user.utils';

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  return (parts[0]?.[0] ?? 'U') + (parts[parts.length - 1]?.[0] ?? '');
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserDTO | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!user) return null;

  const name = getFullName(user);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] border-sky-100">
        <DialogHeader>
          <DialogTitle className="text-slate-800">
            Thông tin người dùng
          </DialogTitle>
        </DialogHeader>

        {/* Cover */}
        <div className="relative rounded-xl border border-sky-100 bg-sky-50">
          {/* chỉ cover mới overflow-hidden */}
          <div className="overflow-hidden rounded-xl">
            <div
              className="h-28 w-full bg-linear-to-r from-sky-100 via-white to-sky-100"
              style={
                user.coverImageUrl
                  ? {
                      backgroundImage: `url(${user.coverImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            />
          </div>

          {/* Avatar + info */}
          <div className="absolute left-4 bottom-0 flex items-end gap-3">
            <Avatar className="h-16 w-16 ring-2 ring-white shadow-sm">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>

            <div className="pb-1">
              <div className="text-lg font-semibold text-slate-800">{name}</div>
              <div className="text-sm text-slate-500">{user.email}</div>
            </div>
          </div>

          {/* spacer để nội dung bên dưới không bị đè */}
          <div className="h-14" />
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-sky-100 bg-white p-3">
            <div className="text-xs text-slate-500">Trạng thái</div>
            <div className="mt-1">
              {user.isActive ? (
                <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
                  HOẠT ĐỘNG
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600 hover:bg-slate-100"
                >
                  BỊ KHÓA
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-white p-3">
            <div className="text-xs text-slate-500">Ngày tham gia</div>
            <div className="mt-1 text-sm font-medium text-slate-800">
              {formatDateVN(user.createdAt)}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-xl border border-sky-100 bg-white p-3">
          <div className="text-xs text-slate-500">Tiểu sử</div>
          <p className="mt-1 text-sm text-slate-700">
            {user.bio || 'Chưa có thông tin tiểu sử.'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
