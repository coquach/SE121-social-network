'use client';

import * as React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminGroupQuery, GroupMemberRange } from '@/lib/actions/admin/admin-group-action';
import { GroupStatus } from '@/models/group/enums/group-status.enum';

type GroupsToolbarProps = {
  filter: AdminGroupQuery;
  onFilterChange: (changes: Partial<AdminGroupQuery>) => void;
  onReset: () => void;
  loading?: boolean;
};

export function GroupsToolbar({ filter, onFilterChange, onReset, loading }: GroupsToolbarProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value === 'all' ? undefined : (value as GroupStatus), cursor: undefined });
  };

  const handleMemberChange = (value: string) => {
    onFilterChange({ memberRange: value === 'all' ? undefined : (value as GroupMemberRange), cursor: undefined });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Tìm kiếm nhóm</div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={filter.name ?? ''}
              onChange={(e) => onFilterChange({ name: e.target.value, cursor: undefined })}
              placeholder="Tên nhóm..."
              className="border-sky-100 pl-9 focus-visible:ring-sky-200"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Trạng thái</div>
          <Select value={filter.status ?? 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={GroupStatus.ACTIVE}>Hoạt động</SelectItem>
              <SelectItem value={GroupStatus.INACTIVE}>Tạm dừng</SelectItem>
              <SelectItem value={GroupStatus.BANNED}>Đã hạn chế</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Số lượng thành viên</div>
          <Select value={filter.memberRange ?? 'all'} onValueChange={handleMemberChange}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn phạm vi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={GroupMemberRange.LT_100}>Dưới 100</SelectItem>
              <SelectItem value={GroupMemberRange.BETWEEN_100_1000}>100 - 1000</SelectItem>
              <SelectItem value={GroupMemberRange.GT_1000}>Trên 1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <Button className="bg-sky-600 text-white hover:bg-sky-700" disabled={loading}>
          <Filter className="mr-1 h-4 w-4" />
          Áp dụng lọc
        </Button>

        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
          onClick={onReset}
          disabled={loading}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
