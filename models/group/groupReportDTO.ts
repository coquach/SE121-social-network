import z from "zod";

export const GroupReportSchema = z.object({
  reason: z.string().max(1000, 'Reason is too long!'),
});
export type CreateGroupReportForm = z.infer<typeof GroupReportSchema>;

export interface GroupReportDTO {
  id: string;
  groupId: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: Date;
}