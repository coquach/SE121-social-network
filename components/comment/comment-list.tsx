'use client';

import { useGetComments } from '@/hooks/user-comment-hook';
import {
  RootType
} from '@/models/social/enums/social.enum';
import { useMemo } from 'react';
import { ErrorFallback } from '../error-fallback';
import { CommentItem } from './comment-item';
import { Button } from '../ui/button';

interface CommentListProps {
  postId: string ;
  rootType: RootType;
}

export const CommentList = ({
  postId,
  rootType,

}: CommentListProps) => {
  const { data, isLoading, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetComments({
    rootId: postId,
    rootType,
  });
  const comments = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const rootComments = comments.filter((c) => !c.parentId);


  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i}>
            <CommentItem.Skeleton />
          </div>
        ))}
      </div>
    );
  }
  if (isError || !data || !postId || !rootType) {
    return (
      <ErrorFallback
        message={error?.message || 'Đã có lỗi xảy ra khi tải bình luận.'}
      />
    );
  }

  
  

  return (
    <div className="space-y-2">
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <div className="w-full p-4 text-center text-gray-500">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận nhé!
          </div>
        ) : (
          rootComments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              rootId={postId}
              rootType={rootType}
            />
          ))
        )}
      </div>
      {
        isFetchingNextPage && (
          <CommentItem.Skeleton />
        )
      }
      {hasNextPage && (
        <Button
          variant="ghost"
          className="text-xs text-sky-600 font-medium mt-1 ml-2"
          onClick={() => fetchNextPage()}
        >
          Tải thêm bình luận
        </Button>
      )}
    </div>
  );
};
