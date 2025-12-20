'use client';
import { RootType } from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import { useCommentModal } from '@/store/use-post-modal';
import { useMemo } from 'react';
import { CommentInput } from '../comment/comment-input';
import { CommentList } from '../comment/comment-list';
import { PostCard } from '../post/post-card';
import { ShareCard } from '../post/share-post';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

export const CommentPostModal = () => {
  const { isOpen, rootId, rootType, data, closeModal } = useCommentModal();
  const renderedPost = useMemo(() => {
    if (!data || !rootId || !rootType) return null;

    if (rootType === RootType.SHARE) {
      return <ShareCard data={data as SharePostSnapshotDTO} />;
    }
    return <PostCard data={data as PostSnapshotDTO} />;
  }, [data, rootType, rootId]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-2xl w-[92vw] max-w-2xl p-0 overflow-hidden overflow-x-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-center text-sky-500">
            Bình luận
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <ScrollArea className="max-h-[65vh]">
          <div className="flex flex-col gap-2 ">
            {renderedPost || (
              <div className="text-center text-gray-500 ">
                Không có dữ liệu bài viết
              </div>
            )}

            {/* Danh sách comment */}
            <div className="px-4">
              {rootId && rootType && (
                <CommentList postId={rootId} rootType={rootType} />
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="px-4 py-3 border-t">
          {rootId && rootType && (
            <CommentInput
              rootId={rootId}
              rootType={rootType}
              placeholder="Viết bình luận..."
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
