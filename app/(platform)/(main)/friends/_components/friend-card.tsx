'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface FriendCardProps {
  userId: string;
  action?: React.ReactNode; // truyền nút hành động từ cha
}

export const FriendCard = ({ userId, action }: FriendCardProps) => {
  const { data: user, isPending, isError, error, refetch } = useGetUser(userId);
  const router = useRouter();

  const goToProfile = useCallback(() => {
    router.push(`/profile/${userId}`);
  }, [router, userId]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-2 p-3 border rounded-xl shadow-sm bg-white">
        <Skeleton className="w-40 h-40 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    );
  }

  if (isError) {
    console.error('FriendCard error:', error);
    return (
      <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-red-50 text-red-600 text-center space-y-2">
        <span>Không thể tải thông tin người dùng 😢</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="text-red-600 border-red-400 hover:bg-red-100"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-3 p-8 border rounded-2xl shadow-sm  hover:bg-gray-50 ">
      {/* Avatar */}
      <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-200 cursor-pointer" onClick={goToProfile}>
        <Image
          src={user.avatarUrl || '/images/placeholder.png'}
          alt={`${user.firstName} ${user.lastName}`}
          fill
          className="object-cover"
        />
      </div>

      {/* Name */}

      <p className="font-semibold text-gray-800 text-lg text-center cursor-pointer" onClick={goToProfile}>
        {user.firstName} {user.lastName}
      </p>

      {/* Action */}
      <div className='w-full flex justify-center items-center'>{action}</div>
    </div>
  );
};
