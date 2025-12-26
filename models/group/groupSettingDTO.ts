import z from "zod";

export const GroupSettingSchema = z.object({
  requiredPostApproval: z.boolean(),
  maxMembers: z.number().int().min(1),
  requireAdminApprovalToJoin: z.boolean(),
});

export const UpdateGroupSettingSchema = GroupSettingSchema.partial().extend({});

export type UpdateGroupSettingForm = z.infer<typeof UpdateGroupSettingSchema>;



export interface GroupSettingDTO {
  id: string;
  groupId: string;
  requiredPostApproval: boolean;
  allowInvites: boolean;
  maxMembers: number;
  requireAdminApprovalToJoin: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}