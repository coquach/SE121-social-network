'use client';

import { MediaDTO, MediaType } from "@/models/social/enums/social.enum";
import { CldImage } from "next-cloudinary";

interface PostMediaProps {
  media?: MediaDTO[];
  mediaRemaining?: number;
  onClick?: () => void;
}

export default function PostMedia({ media, mediaRemaining,onClick}: PostMediaProps) {
  if (!media) return null;

  const preview = media.slice(0, 4);


  return (
    <div
      className={`grid gap-2 rounded-xl overflow-hidden ${
        media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
      }`}
    >
      {preview.map((item, i) => (
        <div key={i} onClick={onClick} className=" relative aspect-square">
          {item.type === MediaType.IMAGE ? (
            <CldImage
              src={item.url}
              fill
              alt={`media-${i}`}
              className="object-cover cursor-pointer hover:opacity-80"
            />
          ) : (
            <video
              src={item.url}
              className="w-full h-full object-cover cursor-pointer"
              controls
              muted
              autoPlay
              playsInline
              preload="metadata"
            />
          )}

          {i === 3 && mediaRemaining && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-semibold cursor-pointer hover:opacity-80 ">
              +{mediaRemaining}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
