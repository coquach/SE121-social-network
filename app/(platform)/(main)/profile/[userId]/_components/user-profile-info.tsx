import { Button } from '@/components/ui/button';
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
  const { data: fetchedUser } = useGetUser(userId);

  const profileModal = useProfileModal();

  const formattedCreatedAt = useMemo(() => {
    if (!fetchedUser?.createdAt) {
      return null;
    }

    return formatDate(fetchedUser.createdAt, 'dd/MM/yyyy');
  }, [fetchedUser?.createdAt]);
  return (
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
                Edit
              </Button>
            ) : (
              <Button variant="default" size="lg">
                Invite
              </Button>
            )}
          </div>
          <p className="text-gray-700 text-sm max-w-md mt-2">
            {fetchedUser?.bio || "Chưa có tiểu sử"}
          </p>
          <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
            <span className='flex items-center gap-1.5'>
              <CalendarDays className='w-4 h-4' />
              {'Joined at ' + formattedCreatedAt}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
