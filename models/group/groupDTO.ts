import z from "zod";
import { GroupPrivacy } from "./enums/group-privacy.enum";
import { GroupStatus } from "./enums/group-status.enum";
import { group } from "console";

export const GroupSchema = z.object({
  name: z.string().max(100, 'Group name is too long!'),
  description: z.string().max(1000, 'Description is too long!').optional(),
  avatarUrl: z.url(),
  coverImageUrl: z.url().optional(),
  privacy: z.enum(GroupPrivacy),
  rules: z.string().max(2000, 'Rules is too long!').optional(),
  groupCategoryId: z.uuid().optional(),
});

export type CreateGroupForm = z.infer<typeof GroupSchema>;

export const UpdateGroupSchema = GroupSchema.partial().extend({});

export type UpdateGroupForm = z.infer<typeof UpdateGroupSchema>;


export interface GroupDTO {
  id: string;
  name: string;
  description?: string;
  avatarUrl: string;
  coverImageUrl: string;
  privacy: GroupPrivacy;
  rules?: string;
  members: number;
  status: GroupStatus;
  createdAt: Date;
}

export interface GroupSummaryDTO {
  groupId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  members: number;
  createdAt: Date;
}