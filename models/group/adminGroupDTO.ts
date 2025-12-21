import { GroupPrivacy } from "./enums/group-privacy.enum";

export interface AdminGroupDTO {
  groupId: string;
  name: string;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  members: number;
  reports: number;
  createdAt: Date;
}