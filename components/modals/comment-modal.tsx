'use client';
import { useCommentModal } from '@/store/use-post-modal';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { PostCard } from '../post/post-card';
import { useMemo } from 'react';
import { ShareCard } from '../post/share-post';
import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import { RootType } from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { CommentList } from '../comment/comment-list';
import { CommentInput } from '../comment/comment-input';

export const CommentPostModal = () => {
  const { isOpen, rootId, rootType, data, closeModal } = useCommentModal();
  const renderedPost = useMemo(() => {
    if (!data) return null;

    if (rootType === RootType.SHARE) {
      return <ShareCard data={data as SharePostSnapshotDTO} />;
    }
    return <PostCard data={data as PostSnapshotDTO} />;
  }, [data, rootType]);
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-center">Bình luận</DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <ScrollArea className="max-h-[80vh]">
          <div className="flex flex-col gap-2 ">
            {renderedPost || (
              <div className="text-center text-gray-500 py-8">
                Không có dữ liệu bài viết
              </div>
            )}

            {/* Danh sách comment */}
            <div className='px-4'>
              <CommentList postId={rootId} rootType={rootType} />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="px-4 py-3 border-t">
          <CommentInput onSubmit={() => {}} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
