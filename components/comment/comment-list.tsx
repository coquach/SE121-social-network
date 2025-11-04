'use client';

import { useGetComments } from '@/hooks/user-comment-hook';
import {
  RootType
} from '@/models/social/enums/social.enum';
import { useMemo } from 'react';
import { ErrorFallback } from '../error-fallback';
import { CommentItem } from './comment-item';

interface CommentListProps {
  postId: string | null;
  rootType: RootType | null;
  onReply?: (parentId: string, text: string) => void;
  onReact?: (commentId: string, type: string) => void;
}
// const comments: CommentDTO[] = [
//   {
//     id: 'c1',
//     userId: 'user_anna',
//     rootId: 'post001',
//     rootType: RootType.POST,
//     content: 'Bài viết này hay ghê 😍',
//     media: [],
//     createdAt: new Date(Date.now() - 1000 * 60 * 10),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 10),
//     isOwner: false,
//     reactedType: ReactionType.LOVE,
//     commentStat: {
//       reactions: 3,
//       likes: 1,
//       loves: 2,
//       hahas: 0,
//       wows: 0,
//       angrys: 0,
//       sads: 0,
//       replies: 2,
//     },
//   },
//   {
//     id: 'c2',
//     userId: 'user_tom',
//     rootId: 'post001',
//     rootType: RootType.POST,
//     content: 'Công nhận luôn, đọc mà thấy chill 😎',
//     media: [],
//     createdAt: new Date(Date.now() - 1000 * 60 * 5),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 5),
//     isOwner: false,
//     reactedType: ReactionType.HAHA,
//     commentStat: {
//       reactions: 5,
//       likes: 3,
//       loves: 1,
//       hahas: 1,
//       wows: 0,
//       angrys: 0,
//       sads: 0,
//       replies: 0,
//     },
//   },
//   // reply cho comment 1
//   {
//     id: 'c3',
//     userId: 'user_jane',
//     rootId: 'post001',
//     rootType: RootType.POST,
//     parentId: 'c1',
//     content: 'Chuẩn luôn! Đọc mà thấy đồng cảm 😄',
//     media: [],
//     createdAt: new Date(Date.now() - 1000 * 60 * 3),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 3),
//     isOwner: false,
//     reactedType: ReactionType.LIKE,
//     commentStat: {
//       reactions: 1,
//       likes: 1,
//       loves: 0,
//       hahas: 0,
//       wows: 0,
//       angrys: 0,
//       sads: 0,
//       replies: 0,
//     },
//   },
//   {
//     id: 'c4',
//     userId: 'user_min',
//     rootId: 'post001',
//     rootType: RootType.POST,
//     parentId: 'c1',
//     content: 'Tui lưu lại rồi, đọc sau hehe 📚',
//     media: [
//       {
//         type: MediaType.IMAGE,
//         url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
//       },
//     ],
//     createdAt: new Date(Date.now() - 1000 * 60 * 2),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 2),
//     isOwner: false,
//     commentStat: {
//       reactions: 0,
//       likes: 0,
//       loves: 0,
//       hahas: 0,
//       wows: 0,
//       angrys: 0,
//       sads: 0,
//       replies: 0,
//     },
//   },
// ];
export const CommentList = ({
  postId,
  rootType,
  onReply,
  onReact,
}: CommentListProps) => {
  const { data, isLoading, isError, error } = useGetComments({
    rootId: postId,
    rootType,
  });
  // const rootComments = comments.filter((c) => !c.parentId);
  // const childMap = new Map<string, CommentDTO[]>();
  // comments.forEach((c) => {
  //   if (c.parentId) {
  //     const arr = childMap.get(c.parentId) ?? [];
  //     arr.push(c);
  //     childMap.set(c.parentId, arr);
  //   }
  // });
  // const getReplies = (id: string) => childMap.get(id) || [];
  const comments = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const rootComments = comments.filter((c) => !c.parentId);


  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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
    <div className="space-y-5">
      <div className="space-y-4">
        { rootComments.length === 0 ? (
          <div className="w-full p-4 text-center text-gray-500">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận nhé!
          </div>
        ) : rootComments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            onReply={onReply}
            onReact={onReact}
          />
        ))}
      </div>
    </div>
  );
};
