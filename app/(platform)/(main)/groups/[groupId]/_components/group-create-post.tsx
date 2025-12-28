'use client';

import { CreatePost } from '@/components/create-post';
import { useGroupPermissionContext } from '@/contexts/group-permission-context';

type GroupCreatePostProps = {
  groupId: string;
  placeholder: string;
};

export const GroupCreatePost = ({
  groupId,
  placeholder,
}: GroupCreatePostProps) => {
  const { role } = useGroupPermissionContext();

  if (!role) return null;

  return (
    <CreatePost
      placeholder={placeholder}
      groupId={groupId}
      isPrivacyChangeable={false}
    />
  );
};
