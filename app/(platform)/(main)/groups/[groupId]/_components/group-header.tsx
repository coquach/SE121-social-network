'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useGetGroupById } from '@/hooks/use-groups';
import { format as formatDate } from 'date-fns';
import { CalendarDays, Globe, Lock } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { HiMiniUserGroup } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { ErrorFallback } from '@/components/error-fallback';

export const GroupHeader = () => {
  const { groupId } = useParams();
  const {
    data: group,
    isLoading,
    isError,
    error
  } = useGetGroupById(groupId as string);

  const formattedCreatedAt = useMemo(() => {
    if (!group?.createdAt) return null;
    return formatDate(new Date(group.createdAt), 'dd/MM/yyyy');
  }, [group?.createdAt]);

  if (isLoading) {
    return (
      <div className="w-full mx-auto">
        <div className="bg-white shadow-sm border overflow-hidden">
          {/* Cover skeleton */}
          <Skeleton className="h-[260px] w-full" />

          <div className="relative px-6 pb-6 pt-16 md:px-10 md:pb-8">
            {/* Avatar skeleton */}
            <div className="absolute -top-16 left-6 md:left-10">
              <Skeleton className="w-32 h-32 rounded-full border-4 border-white shadow-md" />
            </div>

            <div className="flex flex-col gap-3 md:gap-4 mt-2 md:mt-0 md:pl-40">
              {/* Name skeleton */}
              <Skeleton className="h-6 w-48" />
              {/* Description skeleton */}
              <Skeleton className="h-4 w-full max-w-md" />
              {/* Stats skeleton */}
              <div className="flex flex-wrap gap-3 mt-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              {/* Button skeleton */}
              <Skeleton className="h-9 w-32 rounded-lg mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !group) {
    return (
     <ErrorFallback message={error?.message} />
    );
  }

  // const isMember = group.status === 'MEMBER';
  // const isAdmin = false;

  const isPublic = group.privacy === 'PUBLIC';
  const isPrivate = group.privacy === 'PRIVATE';

  return (
    <div className="w-full mx-auto">
      <div className="bg-white   overflow-hidden">
        {/* Cover */}
        <div className="relative h-[300px] w-full border-b">
          {group.coverImageUrl ? (
            <Image
              src={group.coverImageUrl}
              alt="Cover Image"
              fill
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200" />
          )}
        </div>

        {/* Content */}
        <div className="relative px-6 pb-6 pt-16 md:pt-8 md:px-8 md:pb-8 bg-white">
          {/* Avatar */}
          <div className="absolute -top-16 left-6 md:left-10">
            <div className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden">
              <Image
                src={group.avatarUrl || '/images/placeholder.png'}
                alt="Avatar"
                fill
                className="object-cover rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:pl-40">
            {/* Left: Info */}
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                {group.name}
              </h1>

              <p className="text-gray-700 text-sm md:text-base max-w-xl">
                {group.description || 'Chưa có mô tả'}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  {isPublic && <Globe className="w-4 h-4 text-gray-500" />}
                  {isPrivate && <Lock className="w-4 h-4 text-gray-500" />}
                  {isPublic ? 'Công khai' : isPrivate ? 'Riêng tư' : 'Không rõ'}
                </span>

                <span className="flex items-center gap-1.5">
                  <HiMiniUserGroup className="w-5 h-5 text-gray-500" />
                  {group.members ?? 0} thành viên
                </span>

                {formattedCreatedAt && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    Lập vào {formattedCreatedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            {/* 
            <div className="mt-2 md:mt-0 flex flex-col items-stretch gap-2">
              <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                {!isMember ? (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Tham gia nhóm
                  </Button>
                ) : (
                  <Button size="sm" variant="outline">
                    Đã tham gia
                  </Button>
                )}

                {isAdmin && (
                  <Button size="sm" variant="default">
                    Quản lý nhóm
                  </Button>
                )}

                <Button size="sm" variant="secondary">
                  Mời bạn bè
                </Button>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};
