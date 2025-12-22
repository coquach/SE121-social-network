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
  onFilterChange: (changes: Partial<ContentEntryFilter>) => void; // parent đổi filter -> query fetch
  onReset: () => void;
};

function toDateInputValue(d?: Date | string | null) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function ContentToolbar({
  filter,
  onFilterChange,
  onReset,
}: ContentToolbarProps) {
  // local draft (chỉ apply khi bấm nút)
  const [keyword, setKeyword] = React.useState('');
  const [draftTargetType, setDraftTargetType] = React.useState<string>(
    filter.targetType ?? TargetType.POST
  );
  const [draftCreateAt, setDraftCreateAt] = React.useState<string>(
    toDateInputValue(filter.createAt as any)
  );

  // sync draft khi filter từ parent thay đổi (reset, back/forward, external set)
  React.useEffect(() => {
    setDraftTargetType(filter.targetType ?? TargetType.POST);
  }, [filter.targetType]);

  React.useEffect(() => {
    setDraftCreateAt(toDateInputValue(filter.createAt as any));
  }, [filter.createAt]);

  const apply = () => {
    onFilterChange({
      targetType:
        draftTargetType === 'all' ? undefined : (draftTargetType as TargetType),
      createAt: draftCreateAt ? new Date(draftCreateAt) : undefined,
      page: 1,
    });
  };

  const reset = () => {
    setKeyword('');
    setDraftTargetType(TargetType.POST);
    setDraftCreateAt('');
    onReset();
  };

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
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Loại nội dung
          </div>
          <Select value={draftTargetType} onValueChange={setDraftTargetType}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(targetLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Ngày tạo
          </div>
          <Input
            type="date"
            value={draftCreateAt}
            onChange={(e) => setDraftCreateAt(e.target.value)}
            className="border-sky-100 focus-visible:ring-sky-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          className="bg-sky-600 text-white hover:bg-sky-700"
          onClick={apply}
        >
          <Filter className="mr-1 h-4 w-4" />
          Áp dụng
        </Button>

        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
          onClick={reset}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
