'use client';

import { useEffect, useState } from 'react';
import { EditModal } from '../modals/edit-modal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  return (
    <>
      <EditModal />
    </>
  );
};
