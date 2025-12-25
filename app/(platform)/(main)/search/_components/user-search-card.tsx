'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserDTO } from '@/models/user/userDTO';

export const UserSearchCard = ({ user }: { user: UserDTO }) => {
  return (
    <Link href={`/profile/${user.id}`} className="block">
      <Card className="p-4 rounded-xl bg-white hover:shadow-md transition flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={user.avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
          />
          <AvatarFallback>images/placeholder.png</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </div>

            <Badge
              variant={user.isActive ? 'default' : 'secondary'}
              className="h-5"
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>

            {user.relation?.status ? (
              <Badge variant="outline" className="h-5 text-xs">
                {user.relation.status}
              </Badge>
            ) : null}
          </div>

          <div className="text-sm text-gray-600 truncate">{user.email}</div>

          {user.bio ? (
            <div className="text-xs text-gray-500 line-clamp-1 mt-1">
              {user.bio}
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  );
};

UserSearchCard.Skeleton = function UserSearchCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-4 w-full animate-pulse h-[88px]" />
  );
};
