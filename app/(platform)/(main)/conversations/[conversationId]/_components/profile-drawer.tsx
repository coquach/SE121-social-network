'use client';

import { Avatar as AvatarUser } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader
} from '@/components/ui/sheet';
import { useGetUser } from '@/hooks/use-user-hook';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useAuth } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
interface ProfileDrawerProps {
  conversation: ConversationDTO;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (conversationId: string) => void; // thêm callback hủy
}

export const ProfileDrawer = ({
  conversation,
  isOpen,
  onClose,
  onDelete,
}: ProfileDrawerProps) => {
  const { userId } = useAuth();
  const otherUserId = !conversation.isGroup
    ? conversation.participants.find((p) => p !== userId)
    : undefined;
  const { data: otherUser, isLoading } = useGetUser(otherUserId || '');

    const title = useMemo(() => {
      return conversation.isGroup
        ? conversation.groupName
        : `${otherUser?.firstName || 'Người dùng'} ${
            otherUser?.lastName || ''
          }`;
    }
    , [conversation, otherUser]);


    const convCreatedAt = useMemo(() => {
      return conversation.createdAt
        ? format(new Date(conversation.createdAt), 'PPP')
        : 'Không xác định';
    }, [conversation]);


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[400px] flex flex-col items-center justify-between"
      >
        <SheetHeader>
          <div className="p-4 flex flex-col items-center gap-4">
            {conversation.isGroup ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-600">
                  Thành viên: {conversation.participants.length}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <AvatarUser userId={otherUserId || ''} hasBorder isLarge />
                {isLoading ? (
                  <p className="text-sm text-gray-400">Đang tải...</p>
                ) : (
                  <p className="text-lg text-gray-600 font-semibold">{title}</p>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (otherUserId) {
                      window.location.href = `/profile/${otherUserId}`;
                    }
                  }}
                >
                  Đi tới trang cá nhân
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Nội dung hiển thị */}

        <div className="w-full pb-5 pt-5  sm:px-0 sm:pt-0">
          <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
            {!conversation.isGroup && otherUser && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {otherUser.email || 'Không có email'}
                </dd>
              </div>
            )}
            {!conversation.isGroup && otherUser && (
              <>
                <hr />
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ngày tham gia
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {otherUser.createdAt
                      ? format(new Date(otherUser.createdAt), 'PPP')
                      : 'Không xác định'}
                  </dd>
                </div>
              </>
            )}
            <>
              <hr />
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Tạo cuộc trò chuyện
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{convCreatedAt}</dd>
              </div>
            </>
          </dl>
        </div>

        <SheetFooter className="flex flex-col justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="p-3 rounded-full bg-red-100 hover:bg-red-200 transition">
                  <Trash2 className="w-6 h-6 text-red-600 group-hover:text-red-700" />
                </div>
                <span className="text-xs text-gray-400 mt-2">
                  Xoá cuộc trò chuyện
                </span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-red-600'>Xác nhận xoá</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xoá cuộc trò chuyện này? Hành động này
                  không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete?.(conversation._id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Xoá
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
