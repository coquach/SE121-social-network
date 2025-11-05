'use client';

import { useEffect, useState } from 'react';
import { ProfileModal } from '../modals/profile-modal';
import { PostReactionsModal } from '../modals/reaction-modal';
import { CommentPostModal } from '../modals/comment-modal';
import { CreateShareModal } from '../modals/create-share-modal';
import { ShareListModal } from '../modals/shares-list-modal';

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
      <CreateShareModal />
      <ShareListModal/>
    </>
  );
};
