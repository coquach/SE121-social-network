'use client';

import { useEffect, useState } from 'react';
import { ProfileModal } from '../modals/profile-modal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  return (
    <>
      <ProfileModal />
    </>
  );
};
