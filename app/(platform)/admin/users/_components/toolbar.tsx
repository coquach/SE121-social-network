'use client';

import * as React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

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
import { UserStatus } from '@/models/user/systemUserDTO';

type UsersToolbarProps = {
  filter: SystemUserFilter;
  onFilterChange: (changes: Partial<SystemUserFilter>) => void;
  onReset: () => void;
};

export function UsersToolbar({ filter, onFilterChange, onReset }: UsersToolbarProps) {
  const [q, setQ] = React.useState(filter.query ?? '');
  const [status, setStatus] = React.useState<string>(filter.status ?? 'all');

  React.useEffect(() => {
    setQ(filter.query ?? '');
  }, [filter.query]);

  React.useEffect(() => {
    setStatus(filter.status ?? 'all');
  }, [filter.status]);

  const applyFilters = () => {
    onFilterChange({
      query: q.trim() ? q.trim() : undefined,
      status: status === 'all' ? undefined : (status as UserStatus),
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      {/* CỤM TRÁI: filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Tìm kiếm */}
        <div className="">
          <div className="mb-1 text-xs font-medium text-slate-500">
            Tìm kiếm
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                }
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
      </div>

      {/* CỤM PHẢI: actions */}
      <div className="flex items-center gap-2 sm:justify-end">
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
  );
}
