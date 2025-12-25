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
      <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-center text-lg font-semibold">
            Xóa bình luận
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4 text-center">
          <Trash2 className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-gray-700 text-sm">
            Bạn có chắc chắn muốn xóa bình luận này không? Hành động này{' '}
            <span className="font-semibold text-red-500">
              không thể hoàn tác
            </span>
            .
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isPending}
              className="text-gray-700"
            >
              Hủy
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
