import { z } from "zod";

export const UserSchema = z.object({
  username: z.string().optional(),
  email: z.email().optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  coverImageUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
  clerkId: z.string().optional()

});
export type UserForm = z.infer<typeof UserSchema>;

export type UserDTO = {
  ìd: string,
  username: string,
  email: string,
  isActive: boolean,
  firstName: string,
  lastName: string,
  coverImageUrl: string,
  avatarUrl: string,
}






