'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AudienceSelect } from '@/components/audience-select';
import { Avatar } from '@/components/avatar';
import { FormTextarea } from '@/components/form/form-textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useUpdatePost } from '@/hooks/use-post-hook';
import { Audience } from '@/models/social/enums/social.enum';
import {
  PostSnapshotDTO,
  UpdatePostForm,
  UpdatePostSchema,
} from '@/models/social/post/postDTO';
import { useUpdatePostModal } from '@/store/use-post-modal';

export const UpdatePostModal = () => {
  const { isOpen, closeModal, data } = useUpdatePostModal();


  const snapshot = data as PostSnapshotDTO;
  const form = useForm<UpdatePostForm>({
    resolver: zodResolver(UpdatePostSchema),
    defaultValues: {
      content: snapshot?.content ?? '',
      audience: snapshot?.audience ?? Audience.PUBLIC,
    },
  });

  const { mutateAsync: updatePost, isPending } = useUpdatePost(snapshot?.postId ?? '');

  useEffect(() => {
    form.reset({
      content: snapshot?.content ?? '',
      audience: snapshot?.audience ?? Audience.PUBLIC,
    });
  }, [snapshot, form]);

  const handleSubmit = (vals: UpdatePostForm) => {
    const promise = updatePost(vals).then(() => closeModal());
    toast.promise(promise, { loading: 'Đang cập nhật bài viết...' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-lg font-semibold text-center">
            Chỉnh sửa bài viết
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-row items-start gap-4 p-4">
            <Avatar userId={snapshot?.userId} hasBorder isLarge />

            <div className="flex-1 space-y-2 p-2">
              <AudienceSelect
                value={form.watch('audience') as Audience}
                onChange={(val) => form.setValue('audience', val)}
              />

              <FormTextarea
                id="content"
                placeholder="Cập nhật nội dung..."
                defaultValue={form.getValues('content')}
                className="w-full resize-none bg-transparent text-sm placeholder-gray-400 text-gray-700"
                errors={form.formState.errors}
                {...form.register('content')}
              />
            </div>
          </div>

          <div className="flex justify-end p-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isPending}

            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
