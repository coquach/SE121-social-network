'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Loader } from '@/components/loader-componnet';
import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { GroupRole } from '@/models/group/enums/group-role.enum';

const ADMIN_ROLES = new Set<GroupRole>([
  GroupRole.OWNER,
  GroupRole.ADMIN,
  GroupRole.MODERATOR,
]);

export const GroupAdminGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { role, isLoading, isError } = useGroupPermissionContext();
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId;

  useEffect(() => {
    if (isLoading) return;
    const allowed = !!role && ADMIN_ROLES.has(role);
    if (!allowed || isError) {
      router.replace(groupId ? `/groups/${groupId}` : '/groups');
    }
  }, [isLoading, isError, role, router, groupId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader size={28} />
      </div>
    );
  }

  const allowed = !!role && ADMIN_ROLES.has(role);
  if (!allowed || isError) return null;

  return <>{children}</>;
};
