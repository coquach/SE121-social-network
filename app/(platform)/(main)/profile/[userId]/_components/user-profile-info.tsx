'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { useProfileModal } from '@/store/use-profile-modal';
import { format as formatDate } from 'date-fns';
import {
  CalendarDays,
  Check,
  PenBox,
  ShieldAlert,
  ShieldX,
  UserPlus,
  UserX,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { CldImage } from 'next-cloudinary';
import {
  useAcceptFriendRequest,
  useBlockUser,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRequestFriend,
  useUnblock,
} from '@/hooks/use-friend-hook';
import { useParams } from 'next/navigation';

export const UserProfileInfo = () => {
  const { userId } = useParams();
  const {
    data: fetchedUser,
    isLoading,
    isError,
    error,
  } = useGetUser(userId as string);

  const { mutateAsync: requestFriend } = useRequestFriend(userId as string);
  const { mutateAsync: acceptFriendRequest } = useAcceptFriendRequest(
    userId as string
  );
  const { mutateAsync: declineFriendRequest } = useRejectFriendRequest(
    userId as string
  );
  const { mutateAsync: cancelFriendRequest } = useCancelFriendRequest(
    userId as string
  );
  const { mutateAsync: removeFriend } = useRejectFriendRequest(
    userId as string
  );
  const { mutateAsync: blockUser } = useBlockUser(userId as string);
  const { mutateAsync: unblockUser } = useUnblock(userId as string);

  const profileModal = useProfileModal();

  const formattedCreatedAt = useMemo(() => {
    if (!fetchedUser?.createdAt) return null;
    return formatDate(new Date(fetchedUser.createdAt), 'dd/MM/yyyy');
  }, [fetchedUser?.createdAt]);

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
              <Skeleton className="h-6 w-40" />
              {/* Bio skeleton */}
              <Skeleton className="h-4 w-full max-w-md" />
              {/* Button skeleton */}
              <Skeleton className="h-9 w-28 rounded-lg mt-2" />
              {/* Joined date skeleton */}
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorFallback message={error.message} />;
  }

  if (!fetchedUser) return null;

  const relationStatus = fetchedUser.relation?.status;

  return (
    <div className="w-full mx-auto">
      <div className="bg-white overflow-hidden">
        {/* Cover */}
        <div className="relative h-[300px] w-full border-b-1">
          {fetchedUser.coverImageUrl ? (
            <CldImage
              src={fetchedUser.coverImageUrl}
              alt="Cover Image"
              fill
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200" />
          )}
        </div>

        {/* Content */}
        <div className="relative px-6 pb-6 pt-16 md:pt-8 md:px-10 md:pb-8 bg-white">
          {/* Avatar */}
          <div className="absolute -top-16 left-6 md:left-10">
            <div className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden">
              <Image
                src={fetchedUser.avatarUrl || '/images/placeholder.png'}
                alt="Avatar"
                fill
                className="object-cover rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:pl-40">
            {/* Name + Bio */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                  {fetchedUser.firstName} {fetchedUser.lastName}
                </h1>
              </div>

              <p className="text-gray-700 text-sm md:text-base max-w-xl whitespace-pre-line">
                {fetchedUser.bio || 'Chưa có tiểu sử'}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                {formattedCreatedAt && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    {'Tham gia vào ' + formattedCreatedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-2 md:mt-0 flex flex-col items-stretch gap-2">
              {relationStatus === 'SELF' ? (
                <Button
                  size="sm"
                  className="self-start"
                  onClick={() => profileModal.onOpen(userId as string)}
                >
                  <PenBox className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                  {/* NONE → Kết bạn */}
                  {relationStatus === 'NONE' && (
                    <Button
                      size="sm"
                      onClick={() => requestFriend(userId as string)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Kết bạn
                    </Button>
                  )}

                  {/* REQUESTED_OUT → Hủy lời mời */}
                  {relationStatus === 'REQUESTED_OUT' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelFriendRequest(userId as string)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Hủy lời mời
                    </Button>
                  )}

                  {/* REQUESTED_IN → Chấp nhận / Từ chối */}
                  {relationStatus === 'REQUESTED_IN' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => acceptFriendRequest(userId as string)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Chấp nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineFriendRequest(userId as string)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                    </>
                  )}

                  {/* FRIEND → Hủy kết bạn */}
                  {relationStatus === 'FRIEND' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFriend(userId as string)}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Hủy kết bạn
                    </Button>
                  )}

                  {/* BLOCK / UNBLOCK */}
                  {relationStatus !== 'SELF' &&
                    (relationStatus === 'BLOCKED' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => unblockUser(userId as string)}
                      >
                        <ShieldX className="w-4 h-4 mr-2" />
                        Bỏ chặn
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => blockUser(userId as string)}
                      >
                        <ShieldAlert className="w-4 h-4 mr-1" />
                        Chặn
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
