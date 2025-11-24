import {
  getConversationById
} from '@/lib/actions/chat/chat-actions';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { EmptyState } from '../_components/empty-state';
import { Body } from './_components/body';
import { FormInput } from './_components/form-input';
import { Header } from './_components/header';

export default async function ConversationIdPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  const queryClient = getQueryClient();
  const conversation = await queryClient.fetchQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');
      return await getConversationById(token, conversationId);
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {!conversation ? (
        <div className="lg:pl-100 h-full">
          <div className="h-full flex flex-col">
            <EmptyState />
          </div>
        </div>
      ) : (
        <div className="lg:pl-100 h-full">
          <div className="h-full flex flex-col">
            {/* Conversation UI goes here */}
            <Header conversation={conversation} />
            <Body />
            <FormInput />
          </div>
        </div>
      )}
    </HydrationBoundary>
  );
}
