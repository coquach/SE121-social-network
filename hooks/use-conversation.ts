import { getConversationById, getConversationList } from '@/lib/actions/chat/chat-actions';
import { CursorPageResponse, CursorPagination } from '@/lib/cursor-pagination.dto';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { get } from 'http';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export const useConversation = () => {
  const params = useParams();

  const conversationId = useMemo(() => {
    if (!params?.conversationId) {
      return '';
    }

    return params.conversationId as string;
  }, [params?.conversationId]);

  const isOpen = useMemo(() => !!conversationId, [conversationId]);

  return useMemo(()=> ({
    isOpen,
    conversationId
  }), [isOpen, conversationId])
};

export const useGetConversationList = (query: CursorPagination) => {
  const {getToken} = useAuth();
  return useInfiniteQuery<CursorPageResponse<ConversationDTO>>(

    {
      queryKey: ['conversations'],
      queryFn: async ({ pageParam }) => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');
        return await getConversationList(token, {
          ...query,
          cursor: pageParam,
        } as CursorPagination);
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.nextCursor : undefined,
      initialPageParam: undefined,
    }
  );
}


export const useGetConversationById = (conversationId: string) => {
  const {getToken} = useAuth();
  return useQuery<ConversationDTO>(
    {
      queryKey: ['conversation', conversationId],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');
        return await getConversationById(token, conversationId);
      },
      enabled: !!conversationId
    }
  );
}