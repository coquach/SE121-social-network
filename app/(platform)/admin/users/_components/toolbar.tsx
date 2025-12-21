'use client';

import * as React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function UsersToolbar() {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<string>('all');

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
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Bị khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ngày tham gia */}
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Ngày tham gia
          </div>
          <Input
            type="date"
            className="border-sky-100 focus-visible:ring-sky-200"
          />
        </div>
      </div>

      {/* CỤM PHẢI: actions */}
      <div className="flex items-center gap-2 sm:justify-end">
        <Button>Lọc</Button>

        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
