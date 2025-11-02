'use client';

import { Globe, Users, Lock, BadgeCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Audience } from '@/models/social/enums/social.enum';
import { Avatar } from '../avatar';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUser } from '@/hooks/use-user-hook';
import { formatDistanceToNowStrict } from 'date-fns';
import { is } from 'zod/v4/locales';

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
  isShared
}: PostHeaderProps) {
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
      ? 'Public'
      : audience === Audience.FRIENDS
      ? 'Friends'
      : 'Only me';
  const goToUser = useCallback(() => {
    router.push(`/profile/${userId}`);
  }, [router, userId]);

  const createdAtFormat = useMemo(() => {
    if (!createdAt) return null;
    return formatDistanceToNowStrict(new Date(createdAt));
  }, [createdAt]);
  return (
    <div className="inline-flex items-center gap-3">
      <Avatar userId={userId} hasBorder isLarge />
      <div>
        <div className="flex items-center space-x-1">
          <div className="flex items-center gap-1">
            <span className="text-neutral-700 cursor-pointer hover:underline">
              {(data?.firstName || 'firsName') + ' ' + (data?.lastName || 'lastName')}
            </span>
            {isShared && <span className="text-neutral-500 text-sm">đã chia sẻ</span>}
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
    </div>
  );
}



