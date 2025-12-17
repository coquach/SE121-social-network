/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AudienceSelect } from '@/components/audience-select';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreatePost } from '@/hooks/use-post-hook';
import { MediaItem } from '@/lib/types/media';
import { feelingsUI } from '@/lib/types/feeling';
import {
  Audience,
  Emotion,
  MediaType,
} from '@/models/social/enums/social.enum';
import { CreatePostForm, PostSchema } from '@/models/social/post/postDTO';
import { useAuth } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TbMoodPlus } from 'react-icons/tb';
import { toast } from 'sonner';
import { FeelingHoverPopup } from './feeling-hover-popup';
import { EmojiButton } from './emoji-button';
import { countChars } from '@/utils/count-chars';

interface CreatePostProps {
  placeholder?: string;
  groupId?: string;
  isPrivacyChangeable?: boolean;
}

const MAX_MEDIA = 10;
const MAX_WORDS = 200; // tuỳ bà



export const CreatePost = ({
  placeholder = 'Bạn đang nghĩ gì?',
  groupId,
  isPrivacyChangeable = true,
}: CreatePostProps) => {
  const { userId } = useAuth();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [previews, setPreviews] = useState<
    { file: File; type: MediaType; preview: string }[]
  >([]);

  const [openFeeling, setOpenFeeling] = useState(false);
  const feelingWrapRef = useRef<HTMLDivElement | null>(null);

  const { mutateAsync: createPost, isPending } = useCreatePost();

  // ---- TanStack Form ----
  const form = useForm({
    defaultValues: {
      content: '',
      audience: Audience.PUBLIC,
      feeling: undefined as Emotion | undefined,
      groupId,
    } satisfies CreatePostForm,

    // Zod schema (Standard Schema) onChange
    validators: {
      onChange: ({ value }) => {
        const parsed = PostSchema.safeParse(value);
        return parsed.success ? undefined : parsed.error.issues[0]?.message;
      },
    },

    onSubmit: async ({ value }) => {
      const promise = createPost(
        { form: value, media },
        {
          onSuccess: () => {
            form.reset();
            setMedia([]);
          },
        }
      );

      toast.promise(promise, { loading: 'Đang đăng bài...' });
      await promise;
    },
  });

  // ---- Media previews ----
  useEffect(() => {
    const newPreviews = media.map((item) => {
      const existing = previews.find((p) => p.file === item.file);
      if (existing) return existing;
      return { ...item, preview: URL.createObjectURL(item.file) };
    });

    setPreviews(newPreviews);

    return () => {
      previews.forEach((p) => {
        if (!media.includes(p as any)) {
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

  // ---- Close feeling popup on outside click / ESC ----
  useEffect(() => {
    if (!openFeeling) return;

    const onMouseDown = (e: MouseEvent) => {
      const el = feelingWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpenFeeling(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenFeeling(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openFeeling]);

  const selectedFeeling = useMemo(() => {
    const emotion = form.state.values.feeling;
    return feelingsUI.find((f) => f.type === (emotion as Emotion)) ?? null;
  }, [form.state.values.feeling]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Avatar userId={userId as string} hasBorder isLarge />

          {isPrivacyChangeable && (
            <form.Field
              name="audience"
              children={(field) => (
                <AudienceSelect
                  value={field.state.value as Audience}
                  onChange={(value) => field.handleChange(value as any)}
                />
              )}
            />
          )}

          {selectedFeeling && (
            <div className="text-sm text-neutral-400 flex items-center gap-1">
              <span>đang cảm thấy</span>
              <span className="text-base">{selectedFeeling.emoji}</span>
              <span className="font-medium text-neutral-500">
                {selectedFeeling.name}
              </span>
            </div>
          )}
        </div>

        {/* Content textarea (InputGroup + word count) */}
        <form.Field
          name="content"
          validators={{
            onChange: ({ value }) => {
              // optional local limit (UI-level)
              const wc = countChars(value ?? '');
              if (wc > MAX_WORDS) return `Tối đa ${MAX_WORDS} từ.`;
              return undefined;
            },
          }}
          children={(field) => {
            const value = field.state.value ?? '';
            const wordCount = countChars(value);
            const hasError = Boolean(field.state.meta.errors?.length);

            return (
              <div className="relative rounded-2xl border border-gray-200 bg-gray-50/60 focus-within:bg-white focus-within:border-gray-300 transition">
                <textarea
                  id="content"
                  value={value}
                  placeholder={placeholder}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full resize-none bg-transparent outline-none text-base text-gray-800 placeholder:text-gray-400 px-4 pt-4 pb-10 min-h-[88px]"
                />

                {/* word counter */}
                <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                  {wordCount}/{MAX_WORDS} từ
                </div>

                {/* error */}
                {hasError && (
                  <div className="px-4 pb-3 text-xs text-red-500">
                    {field.state.meta.errors?.[0]}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Media preview */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-xl bg-gray-50 p-2">
            {previews.map((item, i) => (
              <div key={i} className="relative group">
                {item.type === MediaType.IMAGE ? (
                  <Image
                    src={item.preview}
                    alt=""
                    height={96}
                    width={96}
                    className="rounded-xl object-cover h-24 w-24"
                  />
                ) : (
                  <video
                    src={item.preview}
                    className="rounded-xl object-cover h-24 w-24"
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
        <div className="flex items-center justify-between border-t border-gray-200 pt-3 gap-2">
          <div className="flex items-center gap-3">
            <label
              htmlFor="images"
              className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
              title="Ảnh"
            >
              <ImageIcon className="size-5 text-gray-600" />
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
              className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
              title="Video"
            >
              <VideoIcon className="size-5 text-gray-600" />
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

            {/* Emoji: append vào content đúng TanStack Form */}
            <EmojiButton
              disabled={isPending}
              popupSide="bottom"
              align='center'
              onPick={(emoji) => {
                const current = form.state.values.content ?? '';
                form.setFieldValue('content', current + emoji);
                const el = document.getElementById(
                  'content'
                ) as HTMLTextAreaElement | null;
                el?.focus();
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Feeling */}
            <div className="relative" ref={feelingWrapRef}>
              <button
                type="button"
                onClick={() => setOpenFeeling((v) => !v)}
                className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
                title="Cảm xúc"
              >
                <TbMoodPlus className="h-5 w-5 text-gray-600" />
              </button>

              {openFeeling && (
                <FeelingHoverPopup
                  selectedFeeling={selectedFeeling}
                  onSelect={(f) => {
                    form.setFieldValue('feeling', f?.type ?? undefined);
                    setOpenFeeling(false);
                  }}
                />
              )}
            </div>

            <Button type="submit" disabled={isPending}>
              Đăng
            </Button>
          </div>
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
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </Card>
  );
};
