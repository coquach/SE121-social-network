'use client';

import * as React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

type Props = {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function UsersPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // range label
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // page window
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);

  let start = clamp(page - half, 1, Math.max(1, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const go = (p: number) => {
    const next = clamp(p, 1, totalPages);
    if (next !== page) onPageChange(next);
  };

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        Hiển thị <span className="font-medium text-slate-700">{from}</span>–
        <span className="font-medium text-slate-700">{to}</span> trên{' '}
        <span className="font-medium text-slate-700">{total}</span> người dùng
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={!canPrev}
              className={[
                'border border-sky-200 hover:bg-sky-50',
                !canPrev ? 'pointer-events-none opacity-50' : '',
              ].join(' ')}
              onClick={(e) => {
                e.preventDefault();
                if (canPrev) go(page - 1);
              }}
            />
          </PaginationItem>

          {start > 1 ? (
            <>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  className="border border-sky-200 hover:bg-sky-50"
                  onClick={(e) => {
                    e.preventDefault();
                    go(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          ) : null}

          {pages.map((p) => {
            const active = p === page;
            return (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={active}
                  className={
                    active
                      ? 'bg-sky-500 text-white hover:bg-sky-600'
                      : 'border border-sky-200 hover:bg-sky-50'
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    go(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {end < totalPages ? (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  className="border border-sky-200 hover:bg-sky-50"
                  onClick={(e) => {
                    e.preventDefault();
                    go(totalPages);
                  }}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          ) : null}

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={!canNext}
              className={[
                'border border-sky-200 hover:bg-sky-50',
                !canNext ? 'pointer-events-none opacity-50' : '',
              ].join(' ')}
              onClick={(e) => {
                e.preventDefault();
                if (canNext) go(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
