'use client';

import { CommentDTO } from '@/models/social/comment/commentDTO';
import { CommentInput } from './comment-input';
import { CommentItem } from './comment-item';
import {
  MediaType,
  ReactionType,
  RootType,
} from '@/models/social/enums/social.enum';

interface CommentListProps {
  postId: string | null;
  onReply?: (parentId: string, text: string) => void;
  onReact?: (commentId: string, type: string) => void;
}
const comments: CommentDTO[] = [
  {
    id: 'c1',
    userId: 'user_anna',
    rootId: 'post001',
    rootType: RootType.POST,
    content: 'Bài viết này hay ghê 😍',
    media: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10),
    isOwner: false,
    reactedType: ReactionType.LOVE,
    commentStat: {
      reactions: 3,
      likes: 1,
      loves: 2,
      hahas: 0,
      wows: 0,
      angrys: 0,
      sads: 0,
      replies: 2,
    },
  },
  {
    id: 'c2',
    userId: 'user_tom',
    rootId: 'post001',
    rootType: RootType.POST,
    content: 'Công nhận luôn, đọc mà thấy chill 😎',
    media: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    isOwner: false,
    reactedType: ReactionType.HAHA,
    commentStat: {
      reactions: 5,
      likes: 3,
      loves: 1,
      hahas: 1,
      wows: 0,
      angrys: 0,
      sads: 0,
      replies: 0,
    },
  },
  // reply cho comment 1
  {
    id: 'c3',
    userId: 'user_jane',
    rootId: 'post001',
    rootType: RootType.POST,
    parentId: 'c1',
    content: 'Chuẩn luôn! Đọc mà thấy đồng cảm 😄',
    media: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 3),
    isOwner: false,
    reactedType: ReactionType.LIKE,
    commentStat: {
      reactions: 1,
      likes: 1,
      loves: 0,
      hahas: 0,
      wows: 0,
      angrys: 0,
      sads: 0,
      replies: 0,
    },
  },
  {
    id: 'c4',
    userId: 'user_min',
    rootId: 'post001',
    rootType: RootType.POST,
    parentId: 'c1',
    content: 'Tui lưu lại rồi, đọc sau hehe 📚',
    media: [
      {
        type: MediaType.IMAGE,
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2),
    isOwner: false,
    commentStat: {
      reactions: 0,
      likes: 0,
      loves: 0,
      hahas: 0,
      wows: 0,
      angrys: 0,
      sads: 0,
      replies: 0,
    },
  },
];
export const CommentList = ({ postId, onReply, onReact }: CommentListProps) => {
  // group comment theo parentId
  const rootComments = comments.filter((c) => !c.parentId);
  const childMap = new Map<string, CommentDTO[]>();
  comments.forEach((c) => {
    if (c.parentId) {
      const arr = childMap.get(c.parentId) ?? [];
      arr.push(c);
      childMap.set(c.parentId, arr);
    }
  });

  const getReplies = (id: string) => childMap.get(id) || [];

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {rootComments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            replies={getReplies(c.id)}
            onReply={onReply}
            onReact={onReact}
          />
        ))}
      </div>
    </div>
  );
};
