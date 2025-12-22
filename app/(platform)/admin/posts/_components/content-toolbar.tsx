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
import { ContentEntryFilter } from '@/lib/actions/admin/content-entry-action';
import { TargetType } from '@/models/social/enums/social.enum';

const targetLabels: Record<TargetType, string> = {
  [TargetType.POST]: 'Bài viết',
  [TargetType.SHARE]: 'Chia sẻ',
  [TargetType.COMMENT]: 'Bình luận',
};

type ContentToolbarProps = {
  filter: ContentEntryFilter;
  onFilterChange: (changes: Partial<ContentEntryFilter>) => void;
  onReset: () => void;
};

export function ContentToolbar({ filter, onFilterChange, onReset }: ContentToolbarProps) {
  const [keyword, setKeyword] = React.useState('');

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Từ khóa</div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nội dung, người đăng..."
              className="border-sky-100 pl-9 focus-visible:ring-sky-200"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">Hiện chưa hỗ trợ lọc theo từ khóa.</p>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Loại nội dung</div>
          <Select
            value={filter.targetType ?? 'all'}
            onValueChange={(value) =>
              onFilterChange({ targetType: value === 'all' ? undefined : (value as TargetType), page: 1 })
            }
          >
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(targetLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Ngày tạo</div>
          <Input
            type="date"
            value={filter.createAt ? new Date(filter.createAt).toISOString().slice(0, 10) : ''}
            onChange={(e) => onFilterChange({ createAt: e.target.value ? new Date(e.target.value) : undefined, page: 1 })}
            className="border-sky-100 focus-visible:ring-sky-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <Button className="bg-sky-600 text-white hover:bg-sky-700" disabled>
          <Filter className="mr-1 h-4 w-4" />
          Áp dụng
        </Button>
        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
          onClick={() => {
            setKeyword('');
            onReset();
          }}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
