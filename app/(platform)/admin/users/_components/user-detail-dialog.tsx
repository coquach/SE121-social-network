'use client';

import React from 'react';
import type { SystemUserDTO } from '@/models/user/systemUserDTO';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SystemRole, UserStatus } from '@/models/user/systemUserDTO';
import { formatDateVN, getFullName } from '@/utils/user.utils';

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  return (parts[0]?.[0] ?? 'U') + (parts[parts.length - 1]?.[0] ?? '');
}

const roleLabels: Record<SystemRole, string> = {
  [SystemRole.ADMIN]: 'Quản trị viên',
  [SystemRole.MODERATOR]: 'Điều hành viên',
  [SystemRole.USER]: 'Người dùng',
};

function LabelValue({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-sky-100 bg-white p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === UserStatus.ACTIVE)
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        HOẠT ĐỘNG
      </Badge>
    );

  if (status === UserStatus.BANNED)
    return (
      <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100">
        BỊ KHÓA
      </Badge>
    );

  return (
    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
      ĐÃ XÓA
    </Badge>
  );
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: {
  user: SystemUserDTO | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!user) return null;

  const name = getFullName(user) || user.email || 'Người dùng';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] border-sky-100">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Thông tin người dùng</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-5">
          <Avatar className="h-16 w-16 ring-2 ring-white shadow-sm">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div className="text-lg font-semibold text-slate-800">{name}</div>
            <div className="text-sm text-slate-500">{user.email}</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                {roleLabels[user.role]}
              </Badge>
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <LabelValue label="Mã người dùng" value={user.id} />
          <LabelValue label="Email" value={user.email} />
          <LabelValue label="Ngày tham gia" value={formatDateVN(user.createdAt)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
