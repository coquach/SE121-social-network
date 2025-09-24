'use client';
import { Button } from '@/components/ui/button';
import { useGetUser } from '@/hooks/use-user-hook';
import { useEditModal } from '@/store/use-edit-modal';
import { formatDate } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useMemo } from 'react';

interface UserBioProps {
  userId: string;
}
export const UserBio = ({ userId }: UserBioProps) => {
  const { data: fetchedUser } = useGetUser(userId);

  const editModal = useEditModal()

  const formattedCreatedAt = useMemo(() => {
    if (!fetchedUser?.createdAt) {
      return null;
    }

    return formatDate(fetchedUser.createdAt, 'dd/MM/yyyy');
  }, [fetchedUser?.createdAt]);

  return (
    <div className="border-b-[1px] border-neutral-300 pb-2">
      <div className="flex justify-end p-2">
        {fetchedUser?.relation.status === 'SELF' ? (
          <Button
            variant="secondary"
            onClick={()=> editModal.onOpen(userId)}
            size="lg"
            className="cursor-pointer hover:bg-neutral-300"
          >
            Edit
          </Button>
        ) : (
          <Button variant="default" size="lg">
            Invite
          </Button>
        )}
      </div>
      <div className="mt-6 px-4">
        <div className="flex flex-col">
          <p className="text-neutral-500 text-2xl font-semibold">
            {(fetchedUser?.firstName ?? '') +
              ' ' +
              (fetchedUser?.lastName ?? '')}
          </p>
        </div>
        <div className="flex flex-col mt-2">
          <p>{fetchedUser?.bio || 'No bio'}</p>
          <div className='flex flex-row items-center gap-2 mt-2 text-neutral-400'>
            <CalendarDays size={24} />
            <p>
              Joined at {formattedCreatedAt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
