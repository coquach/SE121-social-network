/* eslint-disable react/no-children-prop */
'use client';

import { useAuth } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TbMoodPlus } from 'react-icons/tb';
import { toast } from 'sonner';

import { AudienceSelect } from '@/components/audience-select';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Field,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

import { useCreatePost } from '@/hooks/use-post-hook';
import { feelingsUI } from '@/lib/types/feeling';
import { MediaItem } from '@/lib/types/media';
import { cn } from '@/lib/utils';
import { countChars } from '@/utils/count-chars';

import {
  Audience,
  Emotion,
  MediaType,
} from '@/models/social/enums/social.enum';
import { CreatePostForm, PostSchema } from '@/models/social/post/postDTO';

import { EmojiButton } from './emoji-button';
import { FeelingPopover } from './feeling-hover-popup';

interface CreatePostProps {
  placeholder?: string;
  groupId?: string;
  isPrivacyChangeable?: boolean;
}

const MAX_MEDIA = 10;
const MAX_WORDS = 2000;

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
  const feelingWrapRef = useRef<HTMLDivElement>(null!);
  const feelingButtonRef = useRef<HTMLButtonElement>(null!);

  const { mutateAsync: createPost, isPending } = useCreatePost();

  const form = useForm({
    defaultValues: {
      content: '',
      audience: Audience.PUBLIC as Audience,
      feeling: undefined as Emotion | undefined,
      groupId,
    } satisfies CreatePostForm,

    validators: {
      onSubmit: ({ value }) => {
        const r = PostSchema.safeParse(value);
        if (r.success) return undefined;
        return r.error.issues.map((i) => i.message);
      },
    },

    onSubmit: async ({ value }) => {
      const promise = createPost(
        { form: {
          content: value.content.trim(),
          audience: value.audience,
          feeling: value.feeling,
          groupId: value.groupId,
        }, media },
        {
          onSuccess: () => {
            form.reset({
              content: '',
              audience: Audience.PUBLIC,
              feeling: undefined,
              groupId,
            });
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
        const exists = media.some((item) => item.file === p.file);
        if (!exists) URL.revokeObjectURL(p.preview);
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
      const target = e.target as HTMLElement | null;
      if (!el) return;
      if (target?.closest('[data-feeling-popup="true"]')) return;
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
      <Card className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Avatar userId={userId as string} hasBorder isLarge />

          {isPrivacyChangeable && (
            <form.Field
              name="audience"
              children={(field) => (
                <AudienceSelect
                  value={field.state.value as Audience}
                  onChange={(value) => field.handleChange(value as Audience)}
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

        {/* Content - InputGroup giống CreateReportModal */}
        <FieldGroup>
          <form.Field
            name="content"
            validators={{
              // ✅ UI-only limit: chặn quá dài
              onChange: ({ value }) => {
                const wc = countChars(value ?? '');
                if (wc > MAX_WORDS)
                  return { message: `Tối đa ${MAX_WORDS} kí tụ.` };
                return undefined;
              },
            }}
            children={(field) => {
              const value = (field.state.value ?? '') as string;
              const wordCount = countChars(value);

              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <InputGroup className="rounded-xl">
                    <InputGroupTextarea
                      id={field.name}
                      name={field.name}
                      value={value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={placeholder}
                      rows={5}
                      disabled={isPending}
                      aria-invalid={isInvalid}
                      className={cn(
                        'max-h-40 resize-none overflow-y-auto min-h-10',
                        'whitespace-pre-wrap wrap-break-word'
                      )}
                    />

                    <InputGroupAddon align="block-end">
                      <InputGroupText
                        className={cn(
                          'tabular-nums',
                          isInvalid && 'text-red-600'
                        )}
                      >
                        {wordCount}/{MAX_WORDS} kí tự
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>

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
            {/* Images */}
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

            {/* Videos */}
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

            {/* Emoji */}
            <EmojiButton
              disabled={isPending}
              popupSide="bottom"
              align="center"
              onPick={(emoji) => {
                const current = form.state.values.content ?? '';
                form.setFieldValue('content', current + emoji);

                // focus textarea (id = field.name = "content")
                const el = document.getElementById(
                  'content'
                ) as HTMLTextAreaElement | null;
                el?.focus();
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Feeling */}
        
            <FeelingPopover
              open={openFeeling}
              onOpenChange={setOpenFeeling}
              selectedFeeling={selectedFeeling}
              onSelect={(f) => {
                form.setFieldValue('feeling', f?.type ?? undefined);
              }}
              side="top" // ✅ 'top' | 'bottom'
            >
              <button
                type="button"
                ref={feelingButtonRef}
                className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
                title="Cảm xúc"
              >
                <TbMoodPlus className="h-5 w-5 text-gray-600" />
              </button>
            </FeelingPopover>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                'disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200'
              )}
            >
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
