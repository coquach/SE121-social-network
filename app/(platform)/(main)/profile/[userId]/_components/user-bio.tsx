'use client';
import { Button } from '@/components/ui/button';
import { useGetUser } from '@/hooks/use-user-hook';
import { useMemo } from 'react';

interface UserBioProps {
  userId: string;
}
export const UserBio = ({ userId }: UserBioProps) => {
  const { data: fetchedUser } = useGetUser(userId);

  // const createdAt = useMemo(() => {

  // })

  return (
    <div className="border-b-[1px] border-neutral-300 pb-2">
      <div className="flex justify-end p-2">
        {fetchedUser?.relation.status === 'SELF' ? (
          <Button variant="secondary" onClick={() => {}} size="lg" className='cursor-pointer hover:bg-neutral-300'>
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
          <p className="text-neutral-600 text-2xl font-semibold">
            {(fetchedUser?.firstName ?? '') +
              ' ' +
              (fetchedUser?.lastName ?? '')}
          </p>
        </div>
        <div className="flex flex-col mt-2">
          <p>{fetchedUser?.bio || 'No bio'}</p>
        </div>
      </div>
    </div>
  );
};
