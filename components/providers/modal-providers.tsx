'use client';

import { useEffect, useState } from 'react';
import { CommentPostModal } from '../modals/comment-modal';
import { CreateShareModal } from '../modals/create-share-modal';
import { DeletePostModal } from '../modals/delete-post-modal';
import { ProfileModal } from '../modals/profile-modal';
import { PostReactionsModal } from '../modals/reaction-modal';
import { ShareListModal } from '../modals/shares-list-modal';
import { UpdatePostModal } from '../modals/update-post-modal';
import { UpdateSharePostModal } from '../modals/update-share-modal';

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
      <DeletePostModal />
      <UpdatePostModal />
      <UpdateSharePostModal/>
    </>
  );
};
