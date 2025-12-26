import { getConversationById } from '@/lib/actions/chat/chat-actions';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ConversationSection } from './conversation-section';


export default async function ConversationIdPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const { getToken } = await auth();
  const token = await getToken();
  const queryClient = getQueryClient();

  await queryClient.fetchQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');
      return await getConversationById(token, conversationId);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConversationSection conversationId={conversationId} />
    </HydrationBoundary>
  );
}
