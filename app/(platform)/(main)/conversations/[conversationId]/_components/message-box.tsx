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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageDTO } from '@/models/message/messageDTO';
import { useReplyStore } from '@/store/use-chat-store';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Copy, Info, MoreHorizontal, Pin, Reply, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { MessageReply } from './message-reply';
import { HiForward } from 'react-icons/hi2';

export const MessageBox = ({
  data,
  lastSeenMap,
  onDelete,
}: {
  data: MessageDTO;
  lastSeenMap: Map<string, string>;
  onDelete: (messageId: string) => void;
}) => {
  const { userId } = useAuth();
  const isOwn = data.senderId === userId;

  // Hàng container: avatar + content trên 1 dòng
  const container = clsx(
    'flex w-full px-3 py-2 gap-2 items-end',
    isOwn && 'flex-row-reverse'
  );

  const [isHovered, setIsHovered] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const { setReplyTo } = useReplyStore();

  const handleReply = () => setReplyTo(data);
  const handleDeleteClick = () => setOpenAlert(true);

  const seenAvatars = Array.from(lastSeenMap.entries())
    .filter(
      ([uid, lastMsgId]) => uid !== data.senderId && lastMsgId === data._id
    )
    .map(([uid]) => uid);

  const sentAgoText = useMemo(() => {
    const created = new Date(data.createdAt);
    const diff = formatDistanceToNowStrict(created, {
      locale: vi,
      addSuffix: true,
    });
    // ví dụ: "2 phút trước"
    return `Đã gửi ${diff}`;
  }, [data.createdAt]);

  return (
    <div
      className={container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <Avatar userId={data.senderId} hasBorder />

      {/* Nội dung + hover actions */}
      <div id={data._id} className="relative flex-1 flex flex-col items-start">
        {/* Hàng nút hover cho own message */}
        {isOwn && !data.isDeleted && (
          <div
            className={clsx(
              'absolute -top-4 flex items-center gap-1 transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0',
              'right-0'
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReply();
              }}
              className="h-7 w-7 flex items-center justify-center rounded-full bg-white/90 shadow-sm border border-gray-200 hover:bg-sky-50"
            >
              <Reply className="h-3.5 w-3.5 text-sky-500" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
              className="h-7 w-7 flex items-center justify-center rounded-full bg-white/90 shadow-sm border border-gray-200 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className={clsx(
                    'h-7 w-7 flex items-center justify-center rounded-full border border-gray-200/70',
                    'bg-white/80 backdrop-blur hover:bg-gray-50 hover:border-gray-300',
                    'shadow-sm transition-all'
                  )}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                className="w-44 rounded-xl border border-slate-200/70 bg-white/95 backdrop-blur shadow-lg shadow-slate-900/5 p-1 text-xs"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                  onClick={() =>
                    navigator.clipboard.writeText(data.content || '')
                  }
                  disabled={!data.content}
                >
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Sao chép nội dung</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-2 py-1.5 opacity-60"
                >
                  <HiForward className="h-3.5 w-3.5 text-slate-400" />
                  <span>Chuyển tiếp (soon)</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-2 py-1.5 opacity-60"
                >
                  <Pin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Ghim tin (soon)</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-2 py-1.5 opacity-70"
                >
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                  <span>Thông tin tin nhắn</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {data.isDeleted ? (
          <span className="italic text-gray-300 text-xs bg-gray-50 rounded-full px-3 py-1">
            Tin nhắn đã bị xoá
          </span>
        ) : (
          <div
            className={clsx(
              'flex flex-col gap-1',
              isOwn ? 'items-end self-end' : 'items-start self-start',
              'max-w-[80%]' // bubble tối đa 80% chiều ngang message row
            )}
          >
            {/* Time */}
            <div className="text-[11px] text-gray-400 mt-0.5">
              {format(new Date(data.createdAt), 'p', { locale: vi })}
            </div>
            {/* Reply To */}
            {data.replyTo && <MessageReply replyTo={data.replyTo} />}

            {/* Media */}
            {!!data.attachments?.length && (
              <div className="flex flex-wrap gap-1.5">
                {data.attachments.map((att, i) =>
                  att.mimeType?.startsWith('image') ? (
                    <div
                      key={i}
                      className="overflow-hidden rounded-lg border bg-black/5 max-h-48 max-w-[240px]"
                    >
                      <Image
                        src={att.url}
                        alt={att.fileName || ''}
                        width={240}
                        height={240}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <video
                      key={i}
                      src={att.url}
                      controls
                      className="rounded-lg border bg-black/5 max-h-48 max-w-[260px] object-cover"
                    />
                  )
                )}
              </div>
            )}

            {/* Text content */}
            {data.content && (
              <div
                className={clsx(
                  // bubble theo nội dung, chỉ wrap khi chạm max-w
                  'text-sm inline-block overflow-hidden py-2 px-3 whitespace-pre-line break-all',
                  'max-w-full',
                  isOwn ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-900',
                  'rounded-2xl'
                )}
              >
                {data.content}
              </div>
            )}
          </div>
        )}

        {/* Seen avatars – chỉ hiện với tin nhắn của mình */}
        {isOwn && !data.isDeleted && (
          <div className="mt-1 self-end">
            {seenAvatars.length > 0 ? (
              <div className="flex items-center gap-1">
                {seenAvatars.map((uid) => (
                  <Avatar key={uid} userId={uid} isSmall hasBorder />
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-gray-400">{sentAgoText}</div>
            )}
          </div>
        )}
      </div>

      {/* Dialog xác nhận xoá */}
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
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                onDelete(data._id);
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
