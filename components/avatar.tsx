'use client';

// DEPRECATED: This file is kept for backward compatibility
// Use compound components from @/components/avatar/index instead
// Example: <Avatar userId={id} size="large"><Avatar.Image /><Avatar.Name /></Avatar>

// Export everything from the new avatar module
export * from './avatar/index';

// Explicit re-exports for convenience variants (helps with TypeScript resolution)
export {
  SimpleAvatar,
  AvatarWithName,
  AvatarWithStatus,
  SmallAvatar,
  MediumAvatar,
  LargeAvatar,
  CommentAvatar,
  PostHeaderAvatar,
  CreatePostAvatar,
  NotificationAvatar,
} from './avatar/variants';

// For backward compatibility, named export Avatar as LegacyAvatar
export { LegacyAvatar as Avatar } from './avatar/index';

