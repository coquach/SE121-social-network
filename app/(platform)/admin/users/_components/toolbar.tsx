'use client';

import * as React from 'react';
import { Search, RotateCcw, Filter, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SystemUserFilter } from '@/lib/actions/admin/admin-users-action';
import { SystemRole, UserStatus } from '@/models/user/systemUserDTO';

type UsersToolbarProps = {
  filter: SystemUserFilter;
  onFilterChange: (changes: Partial<SystemUserFilter>) => void;
  onReset: () => void;
  onCreateUser: () => void;
};

export function UsersToolbar({
  filter,
  onFilterChange,
  onReset,
  onCreateUser,
}: UsersToolbarProps) {
  const [q, setQ] = React.useState(filter.query ?? '');
  const [status, setStatus] = React.useState<string>(filter.status ?? 'all');
  const [role, setRole] = React.useState<string>(filter.role ?? 'all');

  React.useEffect(() => {
    setQ(filter.query ?? '');
  }, [filter.query]);

  React.useEffect(() => {
    setStatus(filter.status ?? 'all');
  }, [filter.status]);

  React.useEffect(() => {
    setRole(filter.role ?? 'all');
  }, [filter.role]);

  const applyFilters = () => {
    onFilterChange({
      query: q.trim() ? q.trim() : undefined,
      status: status === 'all' ? undefined : (status as UserStatus),
      role: role === 'all' ? undefined : (role as SystemRole),
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {/* NHÓM TRÁI: search + status + lọc + reset */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Tìm kiếm */}
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Tìm kiếm
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
              placeholder="Tên hoặc email..."
              className="pl-9 border-sky-100 focus-visible:ring-sky-200"
            />
          </div>
        </div>

        {/* Trạng thái */}
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Trạng thái
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>Hoạt động</SelectItem>
              <SelectItem value={UserStatus.BANNED}>Bị khóa</SelectItem>
              <SelectItem value={UserStatus.DELETED}>Đã xóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vai trò */}
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Vai trò</div>
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={SystemRole.ADMIN}>Quản trị</SelectItem>
              <SelectItem value={SystemRole.MODERATOR}>Điều hành</SelectItem>
              <SelectItem value={SystemRole.USER}>Người dùng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buttons lọc + reset chung 1 cụm */}
        <div className="flex items-center gap-2 sm:pb-[2px]">
          <Button
            className="bg-sky-600 text-white hover:bg-sky-700"
            onClick={applyFilters}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>

          <Button
            variant="outline"
            className="border-sky-200 text-slate-700 hover:bg-sky-50"
            onClick={onReset}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Đặt lại
          </Button>
        </div>
      </div>

      {/* NÚT PHẢI (đẩy sát phải) */}
      <div className="sm:ml-auto">
        <Button
          className="w-full sm:w-auto bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-100"
          onClick={onCreateUser}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Tạo user hệ thống
        </Button>
      </div>
    </div>
  );
}
