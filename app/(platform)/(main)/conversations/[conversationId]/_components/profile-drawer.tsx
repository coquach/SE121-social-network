'use client';

import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trash2, PencilLine, ImageIcon } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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

import {
  ConversationDTO,
  UpdateConversationForm,
} from '@/models/conversation/conversationDTO';
import { useAuth } from '@clerk/nextjs';
import { useGetUser } from '@/hooks/use-user-hook';
import { useUpdateConversation } from '@/hooks/use-conversation';
import { MediaItem } from '@/lib/types/media';
import { MediaType } from '@/models/social/enums/social.enum';
import { GroupAvatar } from '../../_components/group-avatar';
import { DirectAvatar } from '../../_components/direct-avatar';
import Link from 'next/link';
import { vi } from 'date-fns/locale';

interface ProfileDrawerProps {
  conversation: ConversationDTO;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (conversationId: string) => void;
}

export const ProfileDrawer = ({
  conversation,
  isOpen,
  onClose,
  onDelete,
}: ProfileDrawerProps) => {
  const { userId: currentUserId } = useAuth();

  const isGroup = conversation.isGroup;
  const isAdmin = isGroup && conversation.admins?.includes(currentUserId ?? '');

  /** ----------- DIRECT: otherUser ----------- */
  const otherUserId = !isGroup
    ? conversation.participants.find((p) => p !== currentUserId)
    : undefined;

  const { data: otherUser, isLoading: isUserLoading } = useGetUser(
    otherUserId || ''
  );

  const title = useMemo(() => {
    if (isGroup) return conversation.groupName || 'Nhóm không tên';

    return `${otherUser?.firstName || 'Người dùng'} ${
      otherUser?.lastName || ''
    }`.trim();
  }, [isGroup, conversation.groupName, otherUser]);

  const convCreatedAt = useMemo(() => {
    return conversation.createdAt
      ? format(new Date(conversation.createdAt), 'PPP')
      : 'Không xác định';
  }, [conversation.createdAt]);

  /** ----------- GROUP EDIT STATE ----------- */
  const [groupName, setGroupName] = useState(conversation.groupName ?? '');
  const [avatarMedia, setAvatarMedia] = useState<MediaItem | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    setGroupName(conversation.groupName ?? '');
  }, [conversation.groupName]);

  useEffect(() => {
    if (!avatarMedia) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarMedia.file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarMedia]);

  const { mutate: updateConversation, isPending: isUpdating } =
    useUpdateConversation(conversation._id);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMedia({
      file,
      type: MediaType.IMAGE,
    });
  };

  const handleUpdateGroup = () => {
    const trimmedName = groupName.trim();
    const dto: UpdateConversationForm = {
      isGroup: true,
    };

    if (trimmedName) {
      dto.groupName = trimmedName;
    }

    updateConversation(
      {
        dto,
        media: avatarMedia ?? undefined,
        publicId: conversation.groupAvatar?.publicId,
      },
      {
        onSuccess: () => {
          setAvatarMedia(null);
          setAvatarPreview(null);
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // reset local state khi đóng
      setAvatarMedia(null);
      setAvatarPreview(null);
      setGroupName(conversation.groupName ?? '');
      onClose();
    } else {
      onClose(); // Sheet dùng onOpenChange, nên để parent control state
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] flex flex-col justify-between"
      >
        {/* Header */}
        <SheetHeader>
          <div className="p-4 flex flex-col items-center gap-4">
            {isGroup ? (
              <div className="flex flex-col items-center gap-3">
                {/* Avatar group */}
                <div className="relative">
                  <GroupAvatar conversation={conversation} />
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById('group-avatar-input')?.click()
                        }
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-full"
                      >
                        <PencilLine className="w-4 h-4 text-white" />
                        <span className="text-[11px] text-white">
                          Đổi avatar
                        </span>
                      </button>
                      <input
                        id="group-avatar-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </>
                  )}
                </div>

                {/* Preview ảnh mới (nếu có) */}
                {avatarPreview && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAvatarMedia(null);
                        setAvatarPreview(null);
                      }}
                      className="text-xs"
                    >
                      Bỏ chọn ảnh
                    </Button>
                  </div>
                )}

                <div className="flex flex-col items-center gap-1 mt-2">
                  {isAdmin ? (
                    <input
                      className="text-lg font-semibold text-neutral-800 text-center bg-transparent border-b border-dashed border-neutral-300 focus:outline-none focus:border-sky-500"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Nhóm không tên"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-neutral-800">
                      {title}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Thành viên: {conversation.participants.length}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <DirectAvatar userId={otherUserId} className="h-16 w-16" />
                {isUserLoading ? (
                  <p className="text-sm text-gray-400">Đang tải...</p>
                ) : (
                  <p className="text-lg text-gray-600 font-semibold">{title}</p>
                )}
                {otherUserId && (
                  <Link
                    href={`/profile/${otherUserId}`}
                    className="bg-sky-500 px-3 py-3 text-white hover:bg-sky-500/90 text-sm rounded-md"
                  >
                    Xem trang cá nhân
                  </Link>
                )}
              </div>
            )}
          </div>
        </SheetHeader>

        {/* BODY */}
        <div className="w-full pb-5 pt-2 sm:px-0 sm:pt-0 flex-1 overflow-y-auto">
          <dl className="space-y-6 px-4 sm:px-6">
            {/* Direct info */}
            {!isGroup && otherUser && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 border-b border-gray-200 pb-6">
                    {otherUser.email || 'Không có email'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ngày tham gia
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 border-b border-gray-200 pb-6">
                    {otherUser.createdAt
                      ? format(new Date(otherUser.createdAt), 'dd-MM-yyyy', {
                          locale: vi,
                        })
                      : 'Không xác định'}
                  </dd>
                </div>
              </>
            )}

            {/* Conversation meta */}
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Tạo cuộc trò chuyện
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(conversation.createdAt), 'dd-MM-yyyy', {
                  locale: vi,
                })}
              </dd>
            </div>

            {/* Group edit section */}
            {isGroup && isAdmin && (
              <div className="border-t border-gray-200 pt-6 space-y-2">
                <dt className="text-sm font-medium text-gray-500">
                  Chỉnh sửa thông tin nhóm
                </dt>
                <dd className="text-sm text-gray-900 space-y-2">
                  <p className="text-xs text-gray-500">
                    Bạn có thể thay đổi tên nhóm và avatar. Các thành viên khác
                    sẽ thấy cập nhật ngay lập tức.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleUpdateGroup}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* FOOTER: Delete conversation */}
        <SheetFooter className="flex flex-col gap-4">
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
                <AlertDialogTitle className="text-red-600">
                  Xác nhận xoá
                </AlertDialogTitle>
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
