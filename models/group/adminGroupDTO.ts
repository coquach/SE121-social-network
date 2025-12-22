import { GroupPrivacy } from './enums/group-privacy.enum';
import { GroupStatus } from './enums/group-status.enum';

export interface AdminGroupDTO {
  id: string;
  name: string;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  members: number;
  reports: number;
  createdAt: Date;
  status?: GroupStatus;
}
