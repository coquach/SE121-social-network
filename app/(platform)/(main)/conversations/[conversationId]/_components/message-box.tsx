'use client';
import { Avatar } from '@/components/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MessageDTO } from '@/models/message/messageDTO';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState } from 'react';
import { MessageReply } from './message-reply';
import { useReplyStore } from '@/store/use-chat-store';
import { da } from 'zod/v4/locales';

export const MessageBox = ({
  data,
  lastSeenMap,
  onDelete,
}: {
  data: MessageDTO;
  lastSeenMap: Record<string, string>;
  onDelete: (messageId: string) => void;
}) => {
  const { userId } = useAuth();
  const isOwn = data.senderId === userId;
  const seenList = (data.seenBy || []).filter((uid) => uid !== data.senderId);

  const container = clsx('flex gap-3 p-4', isOwn && 'justify-end');
  const avtar = clsx(isOwn && 'order-2');
  const body = clsx('flex flex-col gap-2', isOwn && 'items-end');

  const seenAvatars = seenList.filter((uid) => lastSeenMap[uid] === data._id);

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const { setReplyTo } = useReplyStore();

  return (
    <div
      className={container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      <div className={avtar}>
        <Avatar userId={data.senderId} hasBorder />
      </div>

      <div id={data._id} className={body}>
        <div className="text-xs text-gray-400">
          {format(new Date(data.createdAt), 'p, MMM dd')}
        </div>

        {data.isDeleted ? (
          <span className="italic text-gray-300">Tin nhắn đã bị xoá</span>
        ) : (
          <div className="relative group">
            {/* 3 chấm hover menu cho toàn bộ message */}
            {isOwn && isHovered && (
              <div className="absolute -left-8 top-1/2 -translate-y-1/2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <span className="text-gray-400">⋯</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border shadow-lg rounded-md z-999 w-28">
                    <button
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setReplyTo(data);
                        setShowMenu(false);
                      }}
                    >
                      Phản hồi
                    </button>
                    <button
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-red-500"
                      onClick={() => setOpenAlert(true)}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reply To */}
            {data.replyTo && <MessageReply replyTo={data.replyTo} />}

            {/* Media */}
            {data.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.attachments.map((att, i) =>
                  att.mimeType === 'image' ? (
                    <Image
                      key={i}
                      src={att.url}
                      alt={att.fileName || ''}
                      width={150}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <video
                      key={i}
                      src={att.url}
                      controls
                      className="rounded-lg object-cover w-40 h-40"
                    />
                  )
                )}
              </div>
            )}

            {/* Content */}
            {data.content && (
              <div
                className={clsx(
                  'text-sm w-fit overflow-hidden py-2 px-3 wrap-break-word whitespace-pre-line max-w-[80%] sm:max-w-md md:max-w-lg',
                  isOwn ? 'bg-sky-500 text-white' : 'bg-gray-100',
                  'rounded-full mt-2'
                )}
              >
                <p>{data.content}</p>
              </div>
            )}
          </div>
        )}

        {/* Seen avatars */}
        {isOwn && seenAvatars.length > 0 && (
          <div className="flex items-center gap-2">
            {seenAvatars.map((uid) => (
              <Avatar key={uid} userId={uid} isSmall hasBorder />
            ))}
          </div>
        )}
      </div>
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin nhắn này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowMenu(false);
              }}
            >
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                onDelete(data._id);
                setShowMenu(false);
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
