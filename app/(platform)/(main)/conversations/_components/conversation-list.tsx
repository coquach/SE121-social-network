'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx';
import { MessageCirclePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import { ErrorFallback } from '@/components/error-fallback';
import { useSocket } from '@/components/providers/socket-provider';
import { SearchInput } from '@/components/search-input';
import { useActiveChannel } from '@/hooks/use-active-channel';
import {
  useConversation,
  useCreateConversation,
  useGetConversationList,
} from '@/hooks/use-conversation';
import { UserDTO } from '@/models/user/userDTO';
import { ConversationDTO } from '@/models/conversation/conversationDTO';

import { ConversationBox } from './conversation-box';
import { ConversationSearchOverlay } from './conversation-search-overlay';
import { CreateGroupConversationDialog } from './create-group-chat';

export const ConversationList = () => {
  const { chatSocket } = useSocket();
  const { conversationId, isOpen } = useConversation();
  const [createGroupChatOpen, setCreateGroupChatOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetConversationList({ limit: 20 });

  const { ref, inView } = useInView();

  const [liveConversations, setLiveConversations] = useState<
    Record<string, ConversationDTO>
  >({});

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!chatSocket) return;

    const handleConversationCreated = (conversation: ConversationDTO) => {
      setLiveConversations((prev) => ({
        ...prev,
        [conversation._id]: conversation,
      }));
    };

    const handleConversationUpdated = (conversation: ConversationDTO) => {
      setLiveConversations((prev) => ({
        ...prev,
        [conversation._id]: conversation,
      }));
    };

    const handleConversationDeleted = (conversationId: string) => {
      setLiveConversations((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    };

    const handleMemberLeft = (payload: { conversationId: string }) => {
      const id = payload?.conversationId;
      if (!id) return;

      setLiveConversations((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };

    chatSocket.on('conversation.created', handleConversationCreated);
    chatSocket.on('conversation.updated', handleConversationUpdated);
    chatSocket.on('conversation.deleted', handleConversationDeleted);
    chatSocket.on('conversation.memberJoined', handleConversationCreated);
    chatSocket.on('conversation.memberLeft', handleMemberLeft);

    return () => {
      chatSocket.off('conversation.created', handleConversationCreated);
      chatSocket.off('conversation.updated', handleConversationUpdated);
      chatSocket.off('conversation.deleted', handleConversationDeleted);
      chatSocket.off('conversation.memberJoined', handleConversationCreated);
      chatSocket.off('conversation.memberLeft', handleMemberLeft);
    };
  }, [chatSocket]);

  const allConversations = useMemo(() => {
    const map = new Map<string, ConversationDTO>();

    if (data) {
      for (const page of data.pages) {
        for (const conv of page.data) {
          map.set(conv._id, conv);
        }
      }
    }

    Object.values(liveConversations).forEach((conv) => {
      map.set(conv._id, conv);
    });

    const merged = Array.from(map.values());
    merged.sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });

    return merged;
  }, [data, liveConversations]);

  const allUserIds = useMemo(() => {
    return allConversations.flatMap((conv) => conv.participants);
  }, [allConversations]);

  useActiveChannel(allUserIds);

  const router = useRouter();
  const createConversation = useCreateConversation();
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debounced = useDebouncedCallback((v: string) => {
    setDebouncedQuery(v.trim());
  }, 350);

  const showOverlay = searchText.trim().length > 0;

  const onChangeSearch = (v: string) => {
    setSearchText(v);
    debounced(v);
  };

  const clearSearch = () => {
    setSearchText('');
    setDebouncedQuery('');
  };

  const onPickUser = useCallback(
    async (u: UserDTO) => {
      try {
        const created = await createConversation.mutateAsync({
          dto: {
            isGroup: false,
            participants: [u.id],
          },
        });
        router.push(`/conversations/${created._id}`);
        clearSearch();
      } catch (e) {
        console.error(e);
      }
    },
    [createConversation, router]
  );

  return (
    <>
      <CreateGroupConversationDialog
        open={createGroupChatOpen}
        onOpenChange={setCreateGroupChatOpen}
      />

      <aside
        className={clsx(
          'fixed top-16 bottom-0 lg:w-100 lg:block overflow-y-auto border-r border-gray-200 bg-white',
          isOpen ? 'hidden' : 'block w-full left-0'
        )}
      >
        <div className="px-5">
          <div className="flex items-center justify-between mb-4 pt-4">
            <p className="text-2xl font-bold text-sky-600">Trò chuyện</p>

            <button
              type="button"
              onClick={() => setCreateGroupChatOpen(true)}
              className="rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              aria-label="Tạo trò chuyện nhóm"
            >
              <MessageCirclePlus size={20} />
            </button>
          </div>

          <SearchInput
            className="my-4"
            placeholder="Tìm người nhắn tin..."
            value={searchText}
            onChange={onChangeSearch}
            showBack={showOverlay}
            onBack={clearSearch}
            onClear={clearSearch}
          />

          {showOverlay ? (
            <ConversationSearchOverlay
              query={debouncedQuery}
              onPickUser={onPickUser}
              disabled={createConversation.isPending}
            />
          ) : (
            <div className="space-y-4 pb-6">
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <ConversationBox.Skeleton key={index} />
                ))}

              {isError && (
                <ErrorFallback
                  message={
                    error?.message ?? 'Không tìm thấy danh sách trò chuyện.'
                  }
                />
              )}

              {!isLoading && !isError && allConversations.length === 0 && (
                <div className="w-full h-full flex items-center justify-center p-8 text-neutral-500 text-center">
                  Không có cuộc trò chuyện nào.
                </div>
              )}

              {allConversations.map((conv) => (
                <div
                  key={conv._id}
                  className="transition-all duration-300 ease-in-out transform"
                >
                  <ConversationBox
                    data={conv}
                    selected={conversationId === conv._id}
                  />
                </div>
              ))}

              {isFetchingNextPage && (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  Đang tải thêm...
                </p>
              )}

              <div ref={ref} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
