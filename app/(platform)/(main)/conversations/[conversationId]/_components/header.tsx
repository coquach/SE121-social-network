'use client';
import { Avatar } from '@/components/avatar';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useActiveList } from '@/store/use-active-list';
import { useAuth } from '@clerk/nextjs';
import { ChevronLeft, Ellipsis } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ProfileDrawer } from './profile-drawer';

export const Header = ({ conversation }: { conversation: ConversationDTO }) => {
  const { userId: currentUserId } = useAuth();
  const otherUser = useMemo(() => {
    const others = conversation.participants.filter(
      (participant) => participant !== currentUserId
    );
    return others || [];
  }, [conversation.participants, currentUserId]);

  const { members } = useActiveList();

  const isOnline =
    Array.isArray(members) && otherUser.length > 0
      ? members.some((member) => otherUser.includes(member))
      : false;
  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.participants.length} thành viên`;
    }
    return isOnline ? 'Đang hoạt động' : 'Ngoại tuyến';
  }, [conversation, isOnline]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <ProfileDrawer
        conversation={conversation}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div className="bg-white w-full flex border-b sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/conversations"
            className="lg:hidden block text-sky-500 hover:text-sky-600 transition cursor-pointer"
          >
            <ChevronLeft size={32} />
          </Link>

          {conversation.isGroup ? (
            <div className="flex flex-col">
              <div className="text-lg font-semibold text-neutral-800">
                {conversation.isGroup ? conversation.groupName : 'Người dùng'}
              </div>
              <div className="text-sm font-medium text-neutral-500">
                {statusText}
              </div>
            </div>
          ) : (
            <Avatar
              userId={otherUser[0]}
              hasBorder
              isLarge
              showName
              showStatus
            />
          )}
        </div>
        <Ellipsis
          size={32}
          onClick={() => {
            setDrawerOpen(true);
          }}
          className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
        />
      </div>
    </>
  );
};
