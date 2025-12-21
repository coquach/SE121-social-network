"use client";

import { DonutChart } from './chart-primitives';

const contentDistribution = [
  { label: 'Bạo lực', value: 28, color: '#f43f5e', gradientClass: 'from-rose-500 to-rose-400' },
  { label: 'Spam', value: 24, color: '#fb923c', gradientClass: 'from-amber-400 to-orange-400' },
  { label: 'Lừa đảo', value: 19, color: '#a855f7', gradientClass: 'from-purple-500 to-indigo-500' },
  { label: 'Ngôn từ thù ghét', value: 16, color: '#0ea5e9', gradientClass: 'from-sky-500 to-cyan-500' },
  { label: 'Khác', value: 13, color: '#10b981', gradientClass: 'from-emerald-500 to-green-500' },
];

export function DistributionCard() {
  const total = contentDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Phân loại nội dung vi phạm</h2>
      <p className="text-sm text-slate-500">Tỷ trọng báo cáo theo nhóm lý do phổ biến</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-8 rounded-full bg-linear-to-br from-sky-50 to-white" />
          <DonutChart data={contentDistribution} />
          <div className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-white text-center text-xs font-medium text-slate-700 shadow-sm">
            Tổng
            <br />
            {total} báo cáo
          </div>
        </div>

        <div className="space-y-3">
          {contentDistribution.map((item) => {
            const percentage = Math.round((item.value / total) * 100);

            return (
              <div key={item.label} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full bg-linear-to-br ${item.gradientClass}`}
                    />
                    {item.label}
                  </span>
                  <span className="text-slate-500">{percentage}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-linear-to-r ${item.gradientClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
