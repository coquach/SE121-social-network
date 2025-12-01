'use client';
import { hasGroupPermission } from "@/lib/auth/group-permission";
import { GroupPermission } from "@/models/group/enums/group-permission.enum";
import { GroupRole } from "@/models/group/enums/group-role.enum";
import { GroupDTO } from "@/models/group/groupDTO";
import { createContext, ReactNode, useContext, useMemo } from "react";

type GroupPermissionContextValue = {
  group?: GroupDTO;
  role?: GroupRole;
  can: (permission: GroupPermission) => boolean;
};

const GroupPermissionContext = createContext<
  GroupPermissionContextValue | undefined
>(undefined);

type Props = {
  group: GroupDTO;
  children: ReactNode;
};

export const GroupPermissionProvider = ({ group, children }: Props) => {
  const value = useMemo<GroupPermissionContextValue>(
    () => ({
      group,
      role: group.userRole,
      can: (permission: GroupPermission) =>
        hasGroupPermission(group.userRole, permission),
    }),
    [group]
  );

  return (
    <GroupPermissionContext.Provider value={value}>
      {children}
    </GroupPermissionContext.Provider>
  );
};

export const useGroupPermissionContext = () => {
  const ctx = useContext(GroupPermissionContext);
  if (!ctx) {
    throw new Error(
      'useGroupPermissionContext must be used within GroupPermissionProvider'
    );
  }
  return ctx;
};
