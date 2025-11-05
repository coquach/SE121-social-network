'use client'
import { useSharePost } from "@/hooks/use-share-hook";
import { Audience } from "@/models/social/enums/social.enum";
import { CreateSharePostForm, SharePostSchema } from "@/models/social/post/sharePostDTO";
import { useCreateShareModal } from "@/store/use-post-modal";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AudienceSelect } from "../audience-select";
import { Avatar } from "../avatar";
import { FormTextarea } from "../form/form-textarea";
import SharedPostPreview from "../post/share-post-review";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

export const CreateShareModal = () => {
  const {userId} = useAuth()
  const {isOpen, closeModal, data,  } = useCreateShareModal();


  const form = useForm<CreateSharePostForm>({
    resolver: zodResolver(SharePostSchema),
    defaultValues: {
      content: '',
      audience: Audience.PUBLIC,
      postId: data?.postId || '',
    },
  });
  const audience = form.watch('audience');

  const  {mutateAsync, isPending} = useSharePost(data?.postId || '');
  const onSubmit = async (formData: CreateSharePostForm) => {
    if (!data?.postId) return;
    const promise = mutateAsync(
      { ...formData, postId: data.postId },
      {
        onSuccess: () => {
          form.reset();
          closeModal();
        },
      }
    );
    toast.promise(promise, {
      loading: 'Đang chia sẻ...',
    });
  };
  useEffect(() => {
    if (data) {
      form.reset();
    }
  }, [data, form]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      {/* Dialog Content */}
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-lg font-semibold text-center">
            Chia sẻ bài viết
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-row items-start gap-4 p-4">
            <Avatar userId={userId as string} hasBorder isLarge />

            <div className="flex-1 space-y-2 p-2">
              <AudienceSelect
                value={audience}
                onChange={(value) => {
                  form.setValue('audience', value);
                }}
              />

              {/* Textarea */}
              <FormTextarea
                id="content"
                defaultValue={form.getValues('content')}
                placeholder="Hãy nói gì đó về bài viết này..."
                className="w-full resize-none bg-transparent text-sm placeholder-gray-400 text-gray-700"
                errors={form.formState.errors}
                {...form.register('content')}
              />
            </div>
          </div>

          {/* Shared post preview */}
          {data && (
            <ScrollArea className="max-h-[60vh] p-4">
              <SharedPostPreview post={data} />
            </ScrollArea>
          )}

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <Button type="submit" disabled={isPending}>
              Chia sẻ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}