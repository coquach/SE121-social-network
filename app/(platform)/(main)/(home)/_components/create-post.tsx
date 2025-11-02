'use client';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Audience } from '@/models/social/enums/social.enum';
import { Globe, Image as ImageIcon, Lock, Users, Video as VideoIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface MediaItem {
  file: File;
  type: 'image' | 'video';
}

interface CreatePostProps {
  userId: string;
  placeholder?: string;
}

export const CreatePost = ({
  userId,
  placeholder = "What's on your mind?",
}: CreatePostProps) => {
  const [content, setContent] = useState<string>('');
  const [audience, setAudience] = useState<Audience>(Audience.PUBLIC);
  const [media, setMedia] = useState<MediaItem[]>([]);

  // Tạo preview URLs bằng useMemo
  const previews = useMemo(() => {
    return media.map((item) => ({
      ...item,
      preview: URL.createObjectURL(item.file),
    }));
  }, [media]);

  // Cleanup URLs để tránh memory leak
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [previews]);

  const handleFiles = useCallback((files: File[], type: 'image' | 'video') => {
    const mapped = files.map((file) => ({ file, type }));
    setMedia((prev) => [...prev, ...mapped]);
  }, []);

  return (
    <div className="w-full bg-white p-4 sm:p-8 rounded-xl shadow space-y-4">
      <div className="flex flex-row items-start gap-4">
        <Avatar userId={userId} hasBorder isLarge />

        <div className="flex-1 space-y-2">
          {/* Select quyền riêng tư */}
          <Select
            onValueChange={(value) => setAudience(value as Audience)}
            defaultValue={Audience.PUBLIC}
          >
            <SelectTrigger className="w-36 h-9 text-sm bg-gray-50 border border-gray-200 rounded-lg">
              <SelectValue>
                {audience === Audience.PUBLIC && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <span>Public</span>
                  </div>
                )}
                {audience === Audience.FRIENDS && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span>Friends</span>
                  </div>
                )}
                {audience === Audience.ONLY_ME && (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span>Only Me</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Audience.PUBLIC}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span>Public</span>
                </div>
              </SelectItem>
              <SelectItem value={Audience.FRIENDS}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span>Friends</span>
                </div>
              </SelectItem>
              <SelectItem value={Audience.ONLY_ME}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span>Only Me</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Textarea */}
          <textarea
            onChange={(e) => setContent(e.target.value)}
            value={content}
            className="disabled:opacity-80 peer resize-none mt-2 w-full max-h-20 ring-0 outline-none text-sm p-2 placeholder-gray-400 text-gray-700"
            placeholder={placeholder}
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {previews.map((item, i) => (
            <div key={i} className="relative group">
              {item.type === 'image' ? (
                <Image
                  src={item.preview}
                  alt=""
                  height={80}
                  width={80}
                  className="rounded-md object-cover"
                />
              ) : (
                <video
                  src={item.preview}
                  className="rounded-md object-cover h-20 w-20"
                />
              )}
              <div
                onClick={() =>
                  setMedia(media.filter((_, index) => index !== i))
                }
                className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-300">
        <div className="flex items-center gap-4">
          <label
            htmlFor="images"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
          >
            <ImageIcon className="size-6" />
          </label>
          <input
            type="file"
            id="images"
            accept="image/*"
            hidden
            multiple
            onChange={(e) => {
              if (!e.target.files) return;
              handleFiles(Array.from(e.target.files), 'image');
            }}
          />

          <label
            htmlFor="videos"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
          >
            <VideoIcon className="size-6" />
          </label>
          <input
            type="file"
            id="videos"
            accept="video/*"
            hidden
            multiple
            onChange={(e) => {
              if (!e.target.files) return;
              handleFiles(Array.from(e.target.files), 'video');
            }}
          />
        </div>

        <Button className="cursor-pointer">Post</Button>
      </div>
    </div>
  );
};

CreatePost.Skeleton = function SkeletonCreatePost() {
  return (
    <Card className="w-full bg-white sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4">
      <div className="flex flex-row items-center gap-4">
        {/* Avatar skeleton */}
        <Skeleton className="h-12 w-12 rounded-full" />

        <div className="flex-1">
          {/* Textarea skeleton */}
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </div>

      {/* Fake uploaded images skeleton */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Skeleton className="h-20 w-20 rounded-md" />
        <Skeleton className="h-20 w-20 rounded-md" />
        <Skeleton className="h-20 w-20 rounded-md" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-300">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>

        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </Card>
  );
};
