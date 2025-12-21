"use client";

import { AreaSparkline } from './chart-primitives';

const trendData = [
  { label: 'T2', value: 6200 },
  { label: 'T3', value: 7200 },
  { label: 'T4', value: 6900 },
  { label: 'T5', value: 8800 },
  { label: 'T6', value: 7600 },
  { label: 'T7', value: 9400 },
  { label: 'CN', value: 10200 },
];

export function TrendCard() {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Xu hướng báo cáo trong tuần</h2>
          <p className="text-sm text-slate-500">Tổng hợp báo cáo và lượt xử lý mỗi ngày</p>
        </div>
        <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          Dữ liệu demo
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-sky-50 bg-linear-to-b from-sky-50/40 to-white p-4">
        <AreaSparkline data={trendData} />

        <div className="mt-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
          {trendData.map((item) => (
            <div key={item.label} className="rounded-full bg-sky-50 py-2 text-slate-600">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
