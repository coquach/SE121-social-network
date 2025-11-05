'use client';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Audience, MediaType } from '@/models/social/enums/social.enum';
import {
  Globe,
  Image as ImageIcon,
  Lock,
  Users,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { CreatePostForm, PostSchema } from '@/models/social/post/postDTO';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreatePost } from '@/hooks/use-post-hook';
import { AudienceSelect } from '@/components/audience-select';

export interface MediaItem {
  file: File;
  type: MediaType;
}

interface CreatePostProps {
  userId: string;
  placeholder?: string;
}
const MAX_MEDIA = 10;

export const CreatePost = ({
  userId,
  placeholder = 'Bạn đang nghĩ gì?',
}: CreatePostProps) => {
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [previews, setPreviews] = useState<
    { file: File; type: MediaType; preview: string }[]
  >([]);

  useEffect(() => {
    // tạo preview cho file mới chưa có URL
    const newPreviews = media.map((item) => {
      const existing = previews.find((p) => p.file === item.file);
      if (existing) return existing; // giữ URL cũ nếu có
      return {
        ...item,
        preview: URL.createObjectURL(item.file),
      };
    });

    setPreviews(newPreviews);

    // cleanup cho file bị remove
    return () => {
      previews.forEach((p) => {
        if (!media.includes(p)) {
          URL.revokeObjectURL(p.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);


  const handleFiles = useCallback((files: File[], type: MediaType) => {
    const mapped = files.map((file) => ({ file, type }));

    setMedia((prev) => {
      const total = prev.length + mapped.length;
      if (total > MAX_MEDIA) {
        toast.error(`Bạn không thể tải nhiều hơn ${MAX_MEDIA} tệp.`);
        return prev;
      }
      return [...prev, ...mapped];
    });
  }, []);

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      content: '',
      audience: Audience.PUBLIC,
      feeling: undefined,
      groupId: undefined,
    },
  });
  const audience = form.watch('audience');
  const { mutateAsync: createPost, isPending } = useCreatePost();

  const onSubmit = async (values: CreatePostForm) => {
    const promise = createPost(
      { form: values, media },
      {
        onSuccess: () => {
          form.reset();
          setMedia([]);
        },
      }
    );
    toast.promise(promise, {
      loading: 'Đang đăng bài...',
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar userId={userId} hasBorder isLarge />

          <AudienceSelect
            value={audience}
            onChange={(value) => form.setValue('audience', value)}
          />
        </div>

        {/* Textarea */}
        <FormTextarea
          id="content"
          placeholder={placeholder}
          className="resize-none w-full max-h-[60px] text-base p-4 outline-none placeholder-gray-400 text-gray-700 bg-transparent"
          defaultValue={form.getValues('content')}
          errors={form.formState.errors}
          {...form.register('content')}
        />

        {/* Media preview */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-2">
            {previews.map((item, i) => (
              <div key={i} className="relative group">
                {item.type === MediaType.IMAGE ? (
                  <Image
                    src={item.preview}
                    alt=""
                    height={100}
                    width={100}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <video
                    src={item.preview}
                    className="rounded-lg object-cover h-24 w-24"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setMedia(media.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hidden group-hover:flex"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <div className="flex items-center gap-4">
            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 cursor-pointer transition"
            >
              <ImageIcon className="size-5" />
              <span className="hidden sm:inline">Ảnh</span>
            </label>
            <input
              type="file"
              id="images"
              accept="image/*"
              hidden
              multiple
              onChange={(e) => {
                if (!e.target.files) return;
                handleFiles(Array.from(e.target.files), MediaType.IMAGE);
              }}
            />

            <label
              htmlFor="videos"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 cursor-pointer transition"
            >
              <VideoIcon className="size-5" />
              <span className="hidden sm:inline">Video</span>
            </label>
            <input
              type="file"
              id="videos"
              accept="video/*"
              hidden
              multiple
              onChange={(e) => {
                if (!e.target.files) return;
                handleFiles(Array.from(e.target.files), MediaType.VIDEO);
              }}
            />
          </div>

          <Button type="submit" disabled={isPending}>
            Đăng
          </Button>
        </div>
      </Card>
    </form>
  );
};

CreatePost.Skeleton = function SkeletonCreatePost() {
  return (
    <Card className="w-full bg-white p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <Skeleton className="h-20 w-20 rounded-lg" />
        <Skeleton className="h-20 w-20 rounded-lg" />
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </Card>
  );
};
