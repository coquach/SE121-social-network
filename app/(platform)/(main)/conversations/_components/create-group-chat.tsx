'use client';

import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Users, X } from 'lucide-react';

import { useCreateConversation } from '@/hooks/use-conversation';
import { MediaItem } from '@/lib/types/media';
import {
  ConversarionSchema,
  CreateConversationForm,
} from '@/models/conversation/conversationDTO';
import { MediaType } from '@/models/social/enums/social.enum';
import { UserDTO } from '@/models/user/userDTO';
import { AiFillPicture } from 'react-icons/ai';


const useSearchUsers = (query: string) => {
  const [results] = useState<UserDTO[]>([]);
  const isLoading = Boolean(query) && false;
  return { results, isLoading };
};

type CreateGroupConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateGroupConversationDialog = ({
  open,
  onOpenChange,
}: CreateGroupConversationDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
  } = useForm<CreateConversationForm>({
    resolver: zodResolver(ConversarionSchema),
    defaultValues: {
      isGroup: true,
      participants: [],
      admins: [],
      groupName: '',
    },
    mode: 'onChange',
  });

  const { userId: currentUserId } = useAuth();
  const { mutateAsync: createConversation, isPending } =
    useCreateConversation();

  // -------- Avatar media & preview --------
  const [avatarMedia, setAvatarMedia] = useState<MediaItem | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!avatarMedia) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarMedia.file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarMedia]);

  // -------- Members search & selected --------
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
  const { results: searchResults } = useSearchUsers(search);

  const availableSearchResults = useMemo(
    () =>
      searchResults.filter(
        (u) => !selectedUsers.some((sel) => sel.id === u.id)
      ),
    [searchResults, selectedUsers]
  );

  const handleSelectUser = (user: UserDTO) => {
    if (selectedUsers.some((u) => u.id === user.id)) return;
    setSelectedUsers((prev) => [...prev, user]);
    setSearch('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMedia({
      file,
      type: MediaType.IMAGE,
    });
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const clearAvatar = () => {
    setAvatarMedia(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const resetAll = () => {
    reset({
      isGroup: true,
      participants: [],
      admins: [],
      groupName: '',
    });
    setSelectedUsers([]);
    setSearch('');
    clearAvatar();
  };

  const handleInternalOpenChange = (o: boolean) => {
    if (!o) {
      resetAll();
    }
    onOpenChange(o);
  };

  const onSubmit = async () => {
    if (!currentUserId) {
      toast.error('Không xác định được tài khoản hiện tại.');
      return;
    }

    const groupName = getValues('groupName')?.trim();
    if (!groupName) {
      toast.error('Vui lòng nhập tên nhóm.');
      return;
    }

    if (selectedUsers.length < 2) {
      toast.error('Nhóm nên có ít nhất 2 thành viên (không tính bạn).');
      return;
    }

    const otherIds = selectedUsers.map((u) => u.id);
    const participants = Array.from(new Set([currentUserId, ...otherIds]));

    const payload: CreateConversationForm = {
      isGroup: true,
      participants,
      admins: [currentUserId],
      groupName,
    };

    await createConversation(
      {
        dto: payload,
        media: avatarMedia ?? undefined,
      },
      {
        onSuccess: () => {
          resetAll();
          handleInternalOpenChange(false);
        },
      }
    );
  };

  const disableSubmit = isPending || selectedUsers.length < 2 || !getValues('groupName')?.trim();

  return (
    <Dialog open={open} onOpenChange={handleInternalOpenChange}>
      <DialogContent
        className="
          w-[95vw]
          sm:max-w-[720px]
          max-h-[95vh]
          p-2
          flex
          flex-col
        "
      >
        <DialogHeader className="px-6 pt-4 pb-2 border-b flex flex-col items-center text-center">
          <DialogTitle className="flex items-center gap-2 text-sky-500">
            <Users className="w-4 h-4" />
            <span>Tạo nhóm chat mới</span>
          </DialogTitle>
          <DialogDescription>
            Chọn thành viên và đặt tên cho nhóm trò chuyện.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-3">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Avatar + Tên nhóm */}
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                {/* input file ẩn */}
                <input
                  ref={avatarInputRef}
                  id="conversation-group-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                <div
                  className="relative w-20 h-20 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden flex items-center justify-center cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <AiFillPicture className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                    Bỏ chọn avatar
                  </button>
                )}

                <p className="text-[11px] text-muted-foreground text-center max-w-40">
                  Nên dùng ảnh vuông, tối thiểu 200×200px.
                </p>
              </div>

              {/* Tên nhóm */}
              <div className="flex-1 space-y-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Tên nhóm
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <Input
                    placeholder="Ví dụ: Team Marketing nội bộ"
                    {...register('groupName')}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Tên nhóm giúp mọi người dễ nhận ra cuộc trò chuyện.
                </p>
              </div>
            </div>

            {/* Search thành viên */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Thêm thành viên
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  className="pl-8"
                  placeholder="Tìm kiếm theo tên, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {search && availableSearchResults.length > 0 && (
                <div className="mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-sm">
                  {availableSearchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                    >
                      <Avatar className="h-7 w-7">
                        {user.avatarUrl && (
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.firstName}
                          />
                        )}
                        <AvatarFallback>
                          {user.firstName?.charAt(0)?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {(user.lastName ?? '') + (user.firstName ?? '')}
                        </span>
                        {user.email && (
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-muted-foreground">
                Nhóm nên có ít nhất 2 thành viên khác nhau (không tính bạn).
              </p>
            </div>

            {/* Selected members */}
            {selectedUsers.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Thành viên đã chọn
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                    >
                      <Avatar className="h-4 w-4">
                        {user.avatarUrl && (
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.firstName}
                          />
                        )}
                        <AvatarFallback className="text-[9px]">
                          {user.firstName?.charAt(0)?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.firstName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id)}
                        className="ml-1 inline-flex rounded-full hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}



            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleInternalOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={disableSubmit}>
                {isPending ? 'Đang tạo...' : 'Tạo nhóm chat'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
