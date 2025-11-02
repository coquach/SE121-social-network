import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { useProfileModal } from '@/store/use-profile-modal';
import { formatDate } from 'date-fns';
import { CalendarDays, PenBox, VerifiedIcon } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';

interface UserProfileInfoProps {
  userId: string;
}
export const UserProfileInfo = ({ userId }: UserProfileInfoProps) => {
  const { data: fetchedUser, isLoading, isError, error } = useGetUser(userId);

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
    return (
      <ErrorFallback message={error.message} />
    )
  }
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="relative h-[300px] bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
        {fetchedUser?.coverImageUrl && (
          <Image
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
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {fetchedUser?.firstName} {fetchedUser?.lastName}
                  </h1>
                  <VerifiedIcon size={18} className="text-blue-500" />
                </div>
              </div>
              {fetchedUser?.relation.status === 'SELF' ? (
                <Button
                  variant="secondary"
                  onClick={() => profileModal.onOpen(userId)}
                  size="lg"
                  className="cursor-pointer flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0"
                >
                  <PenBox className="w-4 h-4" />
                  Chỉnh sửa
                </Button>
              ) : (
                <Button variant="default" size="lg">
                  Kết bạn
                </Button>
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
