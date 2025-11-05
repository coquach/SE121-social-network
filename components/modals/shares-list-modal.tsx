'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar } from '../avatar';
import { Loader2 } from 'lucide-react';
import { useShareListModal } from '@/store/use-post-modal';

import { useInView } from 'react-intersection-observer';
import { useGetSharesByPostId } from '@/hooks/use-share-hook';
import { useEffect, useMemo } from 'react';
import PostHeader from '../post/post-header';
import PostContent from '../post/post-content';

export const ShareListModal = () => {
  const { isOpen, closeModal, postId } = useShareListModal();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useGetSharesByPostId(postId ?? '', {});

  const { ref, inView } = useInView({
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allShares = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-center text-lg font-semibold">
            Danh sách chia sẻ
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          {isLoading ? (
            <div className="flex justify-center items-center py-10 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Đang tải...
            </div>
          ) : allShares.length > 0 ? (
            <div className="divide-y">
              {allShares.map((share, idx) => (
                <div
                  key={share.shareId}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 transition"
                  ref={idx === allShares.length - 1 ? ref : null}
                >
                  <PostHeader
                    userId={share.userId}
                    createdAt={share.createdAt}
                    audience={share.audience}
                  />
                  <PostContent content={share.content} />
                </div>
              ))}

              {isFetchingNextPage && (
                <div className="flex justify-center items-center py-4 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang tải thêm...
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              Chưa có ai chia sẻ bài viết này
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
