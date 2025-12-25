'use client';

import { useRouter } from 'next/navigation';
import { useCreateConversation } from '@/hooks/use-conversation';

export const useStartConversation = () => {
  const router = useRouter();
  const { mutate: createConversation, isPending } = useCreateConversation();

  const startConversation = (targetId: string) => {
    createConversation(
      {
        dto: {
          isGroup: false,
          participants: [targetId],
        },
      },
      {
        onSuccess: (conversation) => {
          if (conversation?._id) {
            router.push(`/conversations/${conversation._id}`);
          }
        },
      }
    );
  };

  return { startConversation, isPending };
};
