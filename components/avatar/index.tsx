'use client';

import { AvatarRoot } from './avatar-root';
import { AvatarImage } from './avatar-image';
import { AvatarName } from './avatar-name';
import { AvatarStatus } from './avatar-status';

// Compound component exports
export const Avatar = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Name: AvatarName,
  Status: AvatarStatus,
});

// Re-export individual components
export { AvatarRoot, AvatarImage, AvatarName, AvatarStatus };

// Export convenience variants
export * from './variants';

// Backward compatible Avatar component (DEPRECATED)
interface LegacyAvatarProps {
  userId: string;
  isSmall?: boolean;
  isLarge?: boolean;
  hasBorder?: boolean;
  reactionEmoji?: string;
  showName?: boolean;
  showStatus?: boolean;
  disableClick?: boolean;
}

export const LegacyAvatar = ({
  userId,
  isSmall = false,
  isLarge = false,
  hasBorder = false,
  reactionEmoji,
  showName = false,
  showStatus = false,
  disableClick = false,
}: LegacyAvatarProps) => {
  // Deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[DEPRECATED] LegacyAvatar: Boolean props API is deprecated. Use Avatar compound components instead:\n' +
        'Example: <Avatar userId={id} size="large" hasBorder><Avatar.Image /><Avatar.Name /></Avatar>'
    );
  }

  const size = isLarge ? 'large' : isSmall ? 'small' : 'medium';

  return (
    <Avatar userId={userId} size={size} hasBorder={hasBorder} isClickable={!disableClick} reactionEmoji={reactionEmoji}>
      <Avatar.Image showOnlineStatus={!isSmall} />
      {showName && (
        <div className="flex flex-col max-w-[140px]">
          <Avatar.Name />
          {showStatus && <Avatar.Status />}
        </div>
      )}
    </Avatar>
  );
};
