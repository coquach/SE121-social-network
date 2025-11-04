'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetUser } from '@/hooks/use-user-hook';
import { Audience } from '@/models/social/enums/social.enum';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  Edit3,
  Globe,
  Lock,
  MoreHorizontal,
  Trash2,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Avatar } from '../avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface PostHeaderProps {
  userId: string;
  createdAt: Date;
  audience: Audience;
  isShared?: boolean;
}

export default function PostHeader({
  userId,
  createdAt,
  audience,
  isShared,
}: PostHeaderProps) {
  const { userId: currentUserId } = useAuth();
  const router = useRouter();
  const { data } = useGetUser(userId);
  const icon =
    audience === Audience.PUBLIC ? (
      <Globe size={14} />
    ) : audience === Audience.FRIENDS ? (
      <Users size={14} />
    ) : (
      <Lock size={14} />
    );

  const label =
    audience === Audience.PUBLIC
      ? 'Công khai'
      : audience === Audience.FRIENDS
      ? 'Bạn bè'
      : 'Riêng tôi';
  const goToUser = useCallback(() => {
    router.push(`/profile/${userId}`);
  }, [router, userId]);

  const createdAtFormat = useMemo(() => {
    if (!createdAt) return null;
    return formatDistanceToNowStrict(new Date(createdAt));
  }, [createdAt]);

  const isOwner = currentUserId === userId;
  return (
    <div className="inline-flex items-center gap-3 justify-between w-full">
      <Avatar userId={userId} hasBorder isLarge />
      <div className="flex-col flex  flex-1 items-start justify-start ">
        <div className="flex items-center space-x-1">
          <div className="flex items-center gap-1">
            <span
              className="text-neutral-700 cursor-pointer hover:underline"
              onClick={goToUser}
            >
              {(data?.firstName || 'firsName') +
                ' ' +
                (data?.lastName || 'lastName')}
            </span>
            {isShared && (
              <span className="text-neutral-500 text-sm">đã chia sẻ</span>
            )}
          </div>
        </div>
        <div className="text-gray-500 text-sm flex gap-2 items-center">
          {createdAtFormat}
          <Tooltip>
            <TooltipTrigger>{icon}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-100 transition">
              <MoreHorizontal size={18} className="text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="flex items-center gap-2">
              <Edit3 size={16} /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600">
              <Trash2 size={16} className='text-red-600' /> Xóa bài viết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
