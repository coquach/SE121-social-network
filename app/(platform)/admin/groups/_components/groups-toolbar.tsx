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

export function GroupsToolbar() {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [visibility, setVisibility] = React.useState('all');
  const [priority, setPriority] = React.useState('any');

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Tìm kiếm nhóm</div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tên nhóm hoặc người tạo..."
              className="border-sky-100 pl-9 focus-visible:ring-sky-200"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Chế độ hiển thị</div>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn chế độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="public">Công khai</SelectItem>
              <SelectItem value="private">Riêng tư</SelectItem>
              <SelectItem value="hidden">Ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Trạng thái</div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="paused">Tạm dừng</SelectItem>
              <SelectItem value="flagged">Đang bị báo cáo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Ưu tiên xử lý</div>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Tất cả</SelectItem>
              <SelectItem value="reports">Có báo cáo mới</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="low">Độ ưu tiên thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <Button className="bg-sky-600 text-white hover:bg-sky-700">
          <Filter className="mr-1 h-4 w-4" />
          Áp dụng lọc
        </Button>

        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
          onClick={() => {
            setQ('');
            setStatus('all');
            setVisibility('all');
            setPriority('any');
          }}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
