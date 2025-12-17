'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { useSocket } from '@/components/providers/socket-provider';
import { SearchInput } from '@/components/search-input';
import { useActiveChannel } from '@/hooks/use-active-channel';
import {
  useConversation,
  useCreateConversation,
  useGetConversationList,
} from '@/hooks/use-conversation';
import { ConversationDTO } from '@/models/conversation/conversationDTO';

import clsx from 'clsx';
import { MessageCirclePlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { UserDTO } from '@/models/user/userDTO';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
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

  /**
   * liveConversations:
   * - lưu các conversation đến từ WS (created / updated)
   * - key = conversationId
   * - dùng để ghi đè / bổ sung lên data từ React Query
   */
  const [liveConversations, setLiveConversations] = useState<
    Record<string, ConversationDTO>
  >({});

  /** ----------- INFINITE SCROLL ----------- */
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /** ----------- SOCKET HANDLERS ----------- */
  useEffect(() => {
    if (!chatSocket) return;

    const handleConversationCreated = (conversation: ConversationDTO) => {
      setLiveConversations((prev) => {
        // Nếu đã có trong prev và giống hệt thì khỏi set lại
        if (prev[conversation._id])
          return { ...prev, [conversation._id]: conversation };
        return { ...prev, [conversation._id]: conversation };
      });
    };

    const handleConversationUpdated = (conversation: ConversationDTO) => {
      setLiveConversations((prev) => ({
        ...prev,
        [conversation._id]: conversation,
      }));
    };
    const handleConversationDeleted = (conversationId: string) => {
      console.log('Conversation deleted:', conversationId);
      setLiveConversations((prev) => {
        const newConvs = { ...prev };
        delete newConvs[conversationId];
        return newConvs;
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

  /** ----------- MERGE DATA (API + WS) ----------- */
  const allConversations = useMemo(() => {
    const map = new Map<string, ConversationDTO>();

    // 1. Base từ React Query (infinite query)
    if (data) {
      for (const page of data.pages) {
        for (const conv of page.data) {
          map.set(conv._id, conv);
        }
      }
    }

    // 2. Ghi đè / thêm từ liveConversations (WS)
    Object.values(liveConversations).forEach((conv) => {
      map.set(conv._id, conv);
    });

    // 3. Convert ra array + sort theo updatedAt desc
    const merged = Array.from(map.values());
    merged.sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });

    return merged;
  }, [data, liveConversations]);

  /** ----------- PRESENCE: LẤY LIST USER IDS ----------- */
  const allUserIds = useMemo(() => {
    return allConversations.flatMap((conv) => conv.participants);
  }, [allConversations]);

  // Subscribe presence cho toàn bộ userIds; hook này đã tự dedupe.
  useActiveChannel(allUserIds);

  /** ===================== SEARCH STATE ===================== */
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

  const onPickUser = useCallback(async (u: UserDTO) => {
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
  }, [createConversation, router]);
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
          {/* Header */}
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-sky-500">Trò chuyện</div>
            <button
              type="button"
              onClick={() => setCreateGroupChatOpen(true)}
              className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
            >
              <MessageCirclePlus size={20} />
            </button>
          </div>

          {/* Search */}
          <SearchInput
            className="my-4"
            placeholder="Tìm người dùng để nhắn tin..."
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
            <div className="space-y-4">
              {/* Skeleton khi load lần đầu */}
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <ConversationBox.Skeleton key={index} />
                ))}

              {/* Error */}
              {isError && <ErrorFallback message={error.message} />}

              {/* Empty */}
              {!isLoading && !isError && allConversations.length === 0 && (
                <div className="w-full h-full flex items-center justify-center p-8 text-neutral-500 text-center">
                  Không có cuộc trò chuyện nào.
                </div>
              )}

              {/* Data */}
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

              {/* Loading thêm page */}
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
