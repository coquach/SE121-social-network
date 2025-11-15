import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { useProfileModal } from '@/store/use-profile-modal';
import { formatDate } from 'date-fns';
import {
  CalendarDays,
  Check,
  PenBox,
  ShieldAlert,
  ShieldX,
  UserPlus,
  UserX,
  VerifiedIcon,
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

interface UserProfileInfoProps {
  userId: string;
}
export const UserProfileInfo = ({ userId }: UserProfileInfoProps) => {
  const { data: fetchedUser, isLoading, isError, error } = useGetUser(userId);
  const { mutateAsync: requestFriend } = useRequestFriend(userId);
  const { mutateAsync: acceptFriendRequest } = useAcceptFriendRequest(userId);
  const { mutateAsync: declineFriendRequest } = useRejectFriendRequest(userId);
  const { mutateAsync: cancelFriendRequest } = useCancelFriendRequest(userId);
  const { mutateAsync: removeFriend } = useRejectFriendRequest(userId);
  const { mutateAsync: blockUser } = useBlockUser(userId);
  const { mutateAsync: unblockUser } = useUnblock(userId);

  const profileModal = useProfileModal();

  const formattedCreatedAt = useMemo(() => {
    if (!fetchedUser?.createdAt) {
      return null;
    }

    return formatDate(fetchedUser.createdAt, 'dd/MM/yyyy');
  }, [fetchedUser?.createdAt]);

  if (isLoading) {
    return (
      <div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Cover skeleton */}
          <Skeleton className=" relative h-[300px]" />

          <div className="relative py-4 px-6 md:px-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar skeleton */}
              <Skeleton className="w-32 h-32 border-4 border-white absolute shadow-lg -mt-16 rounded-full" />

              <div className="w-full pt-16 md:pt-0 md:pl-36">
                {/* Name skeleton */}
                <Skeleton className="h-6 w-48 mb-2" />
                {/* Bio skeleton */}
                <Skeleton className="h-4 w-full max-w-md mt-2 mb-4" />
                {/* Button skeleton */}
                <Skeleton className="h-10 w-24 mt-4 rounded-lg" />
                {/* Joined date skeleton */}
                <Skeleton className="h-4 w-32 mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorFallback message={error.message} />;
  }
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="relative h-[300px] bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200">
        {fetchedUser?.coverImageUrl && (
          <CldImage
            src={fetchedUser.coverImageUrl}
            alt="Cover Image"
            fill
            className="object-cover w-full h-full"
          />
        )}
      </div>
      <div className="relative py-4 px-6 md:px-8 bg-white">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-32 h-32 bg-gray-300  border-4 border-white shadow-lg absolute -top-16 rounded-full">
            <Image
              src={fetchedUser?.avatarUrl || '/images/placeholder.png'}
              alt="Avatar"
              fill
              className="absolute rounded-full z-2"
            />
          </div>

          <div className="w-full pt-16 md:pt-0 md:pl-36">
            <div className="flex flex-col pb-2 md:flex-row items-start justify-between">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-3 shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {fetchedUser?.firstName} {fetchedUser?.lastName}
                  </h1>
                  <VerifiedIcon size={18} className="text-blue-500" />
                </div>
              </div>
              {fetchedUser?.relation.status === 'SELF' ? (
                <Button onClick={() => profileModal.onOpen(userId)}>
                  <PenBox className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {/* NONE → Kết bạn */}
                  {fetchedUser?.relation.status === 'NONE' && (
                    <Button
                      variant="default"
                      onClick={() => requestFriend(userId)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Kết bạn
                    </Button>
                  )}

                  {/* REQUESTED_OUT → Hủy lời mời */}
                  {fetchedUser?.relation.status === 'REQUESTED_OUT' && (
                    <Button
                      variant="outline"
                      onClick={() => cancelFriendRequest(userId)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Hủy lời mời
                    </Button>
                  )}

                  {/* REQUESTED_IN → Chấp nhận / Từ chối */}
                  {fetchedUser?.relation.status === 'REQUESTED_IN' && (
                    <>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => acceptFriendRequest(userId)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => declineFriendRequest(userId)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                    </>
                  )}

                  {/* FRIEND → Hủy kết bạn */}
                  {fetchedUser?.relation.status === 'FRIEND' && (
                    <Button
                      variant="destructive"
                      onClick={() => removeFriend(userId)}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Hủy kết bạn
                    </Button>
                  )}

                  {/* BLOCKED / Chặn */}
                  {fetchedUser?.relation.status !== 'SELF' &&
                    (fetchedUser?.relation.status === 'BLOCKED' ? (
                      <Button
                        variant="secondary"
                        onClick={() => unblockUser(userId)}
                      >
                        <ShieldX className="w-4 h-4 mr-2" />
                        Bỏ chặn
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => blockUser(userId)}
                      >
                        <ShieldAlert className="w-4 h-4 mr-1" />
                        Chặn
                      </Button>
                    ))}
                </div>
              )}
            </div>
            <p className="text-gray-700 text-sm max-w-md mt-2">
              {fetchedUser?.bio || 'Chưa có tiểu sử'}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {'Tham gia vào ' + formattedCreatedAt}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
