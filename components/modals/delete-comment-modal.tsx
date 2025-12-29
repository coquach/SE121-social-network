'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

import { useDeleteComment } from '@/hooks/user-comment-hook';
import { useDeleteCommentModal } from '@/store/use-post-modal';
import { toast } from 'sonner';

export const DeleteCommentModal = () => {
  const { isOpen, closeModal, rootId, commentId } = useDeleteCommentModal();
  console.log('DeleteCommentModal rendered with commentId:', commentId, 'and rootId:', rootId);
  const { mutateAsync, isPending } = useDeleteComment(rootId ?? '', commentId ?? '');
  
 

  const handleDelete = async () => {
    if (!commentId) {
      toast.error('Không xác định được bình luận cần xóa');
      return;
    }

    const promise = mutateAsync().then(() => {
      closeModal();
    });

    toast.promise(promise, {
      loading: 'Đang xóa bình luận...',
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      <DialogContent className="sm:max-w-sm overflow-hidden rounded-2xl border-rose-200 p-0">
        <DialogHeader className="border-b border-rose-100 bg-white/70 px-4 py-3">
          <DialogTitle className="text-center text-lg font-semibold text-rose-600">
            Xóa bình luận
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4 text-center">
          <Trash2 className="mx-auto h-10 w-10 text-rose-500" />
          <p className="text-gray-700 text-sm">
            Bạn có chắc chắn muốn xóa bình luận này không? Hành động này{' '}
            <span className="font-semibold text-red-500">
              không thể hoàn tác
            </span>
            .
          </p>

          <div className="flex justify-end gap-3 border-t border-rose-100 pt-4">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isPending}
              className="border-rose-200 text-slate-700 hover:bg-rose-50"
            >
              Hủy
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Xóa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
