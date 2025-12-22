import { GroupPrivacy } from "./enums/group-privacy.enum";

export interface AdminGroupDTO {
  id: string;
  name: string;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  members: number;
  reports: number;
  createdAt: Date;
}