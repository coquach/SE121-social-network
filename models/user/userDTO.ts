import { z } from 'zod';

export const UserSchema = z.object({
  email: z.email(),
  isActive: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
  coverImageUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
  clerkId: z.string(),
  bio: z.string().optional(),
});

export const ProfileUpdateSchema = UserSchema.partial().extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export type UserCreateForm = z.infer<typeof UserSchema>;

export type ProfileUpdateForm = z.infer<typeof ProfileUpdateSchema>
export type UserDTO = {
  id: string;
  email: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  coverImageUrl: string;
  avatarUrl: string;
  bio: string;
  createdAt: Date;
  relation: {
    status: string;
  };
};
