'use client';

import { useEffect, useState } from 'react';
import { ProfileModal } from '../modals/profile-modal';
import { PostReactionsModal } from '../modals/reaction-modal';
import { CommentPostModal } from '../modals/comment-modal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  return (
    <>
      <ProfileModal />
      <PostReactionsModal />
      <CommentPostModal />
    </>
  );
};
