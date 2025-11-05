'use client';

import { MediaItem } from '@/app/(platform)/(main)/(home)/_components/create-post';
import { useCreateComment } from '@/hooks/user-comment-hook';
import {
  CommentSchema,
  CreateCommentForm,
} from '@/models/social/comment/commentDTO';
import { MediaType, RootType } from '@/models/social/enums/social.enum';
import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Image as ImageIcon,
  SendHorizonal,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Avatar } from '../avatar';
import { FormTextarea } from '../form/form-textarea';
import { Button } from '../ui/button';

interface CommentInputProps {
  rootId: string;
  rootType: RootType;
  parentId?: string;
  placeholder?: string;
}

export const CommentInput = ({
  rootId,
  rootType,
  parentId,
  placeholder = 'Viết bình luận...',
}: CommentInputProps) => {
  const [media, setMedia] = useState<MediaItem | undefined>(
    undefined
  );
  const { userId } = useAuth();

  // Tạo preview URL cho media
  const preview = useMemo(() => {
    if (!media) return null;
    return URL.createObjectURL(media.file);
  }, [media]);

  // Cleanup URL để tránh memory leak
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);


  const form = useForm<CreateCommentForm>({
    resolver: zodResolver(CommentSchema),
    defaultValues: {
      rootId: rootId,
      rootType: rootType,
      parentId: parentId,
      content: '',
    },
  });
  


  const { mutateAsync: createComment, isPending } = useCreateComment(rootId);

  const handleSubmit = async (values: CreateCommentForm) => {
    const promise = createComment(
      {
        data: values,
        media,
      },
      {
        onSuccess: () => {
          form.reset();
          setMedia(undefined);
        },
      }
    );
    toast.promise(promise, {
      loading: 'Đang đăng bình luận...',
    });
  };
  return (
    <form
      className="flex items-start gap-2 w-full"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Avatar userId={userId as string} hasBorder />
      <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
        {/* Textarea */}
        <FormTextarea
          id="content"
          defaultValue={form.getValues('content')}
          placeholder={placeholder}
          className="resize-nonebg-transparent outline-none text-sm focus-visible:bg-transparent max-h-32"
          errors={form.formState.errors}
          {...form.register('content')}
        />

        {/* Preview media */}
        {preview && (
          <div className="relative mt-2">
            {media?.type === MediaType.IMAGE ? (
              <Image
                src={preview}
                alt="preview"
                width={150}
                height={150}
                className="rounded-md object-cover"
              />
            ) : (
              <video
                src={preview}
                controls
                className="rounded-md w-40 max-h-48 object-cover"
              />
            )}
            <div
              onClick={() => setMedia(undefined)}
              className="absolute top-1 right-1 bg-black/60 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Media buttons + Send */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <label
              htmlFor="comment-image"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <ImageIcon size={18} />
              <input
                type="file"
                id="comment-image"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (!e.target.files?.[0]) return;
                  setMedia({ file: e.target.files[0], type: MediaType.IMAGE });
                }}
              />
            </label>

            <label
              htmlFor="comment-video"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <VideoIcon size={18} />
              <input
                type="file"
                id="comment-video"
                accept="video/*"
                hidden
                onChange={(e) => {
                  if (!e.target.files?.[0]) return;
                  setMedia({ file: e.target.files[0], type: MediaType.VIDEO });
                }}
              />
            </label>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white"
          >
            <SendHorizonal size={18} />
          </Button>
        </div>
      </div>
    </form>
  );
};
