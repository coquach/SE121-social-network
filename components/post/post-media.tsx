'use client';

import { cn } from "@/lib/utils";
import { MediaDTO, MediaType } from "@/models/social/enums/social.enum";
import { CldImage } from "next-cloudinary";
import { useMemo } from "react";

interface PostMediaProps {
  media?: MediaDTO[];
  mediaRemaining?: number;
  onClick?: () => void;
}

export default function PostMedia({ media, mediaRemaining = 0, onClick}: PostMediaProps) {
  const preview = useMemo(
    () => (media?.length ? media.slice(0, 4) : []),
    [media]
  );

  if (!preview.length) return null;

  const isSingle = preview.length === 1;

  const itemBorderClass = (i: number) => {
    // 1 hình: chỉ cần border ngoài wrapper, không cần chia ô
    if (isSingle) return '';

    // grid 2 cột: index: 0 1 / 2 3
    const isLeft = i % 2 === 0;
    const isTop = i < 2;

    // border trong: kẻ đường chia giữa các ô
    // - ô bên trái có border-right
    // - ô hàng trên có border-bottom
    return cn('border-gray-200', isLeft && 'border-r', isTop && 'border-b');
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className={cn('grid', isSingle ? 'grid-cols-1' : 'grid-cols-2')}>
        {preview.map((item, i) => {
          const showMore = i === 3 && mediaRemaining > 0;

          return (
            <div
              key={`${item.url}-${i}`}
              className={cn(
                'relative aspect-square overflow-hidden',
                itemBorderClass(i)
              )}
            >
              {item.type === MediaType.IMAGE ? (
                <button
                  type="button"
                  onClick={onClick}
                  className="group absolute inset-0 w-full h-full cursor-pointer"
                  aria-label="Mở bài viết"
                >
                  <CldImage
                    src={item.url}
                    fill
                    alt={`media-${i}`}
                    sizes={
                      isSingle ? '100vw' : '(min-width: 640px) 50vw, 100vw'
                    }
                    className="object-cover"
                  />
                </button>
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                />
              )}

              {showMore && (
                <button
                  type="button"
                  onClick={onClick}
                  className="absolute inset-0 bg-black/55 flex items-center justify-center hover:bg-black/60 transition"
                  aria-label="Xem thêm media"
                >
                  <span className="text-white text-2xl font-semibold">
                    +{mediaRemaining}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
