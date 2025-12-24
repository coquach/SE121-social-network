'use client';

import { useAuth } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { useInView } from 'react-intersection-observer';
import { Loader2, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AiFillPicture } from 'react-icons/ai';
import { toast } from 'sonner';
import z from 'zod';

import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateConversation } from '@/hooks/use-conversation';
import { useSearchUsers } from '@/hooks/use-search-hooks';
import { MediaItem } from '@/lib/types/media';
import {
  ConversarionSchema,
  CreateConversationForm,
} from '@/models/conversation/conversationDTO';
import { MediaType } from '@/models/social/enums/social.enum';
import { UserDTO } from '@/models/user/userDTO';

type CreateGroupConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const GroupConversationSchema = ConversarionSchema.extend({
  groupName: z.string().trim().min(1, 'Vui lòng nhập tên nhóm.'),
  participants: z
    .array(z.string())
    .min(2, 'Nhóm nên có ít nhất 2 thành viên khác (không tính bạn).'),
});

export const CreateGroupConversationDialog = ({
  open,
  onOpenChange,
}: CreateGroupConversationDialogProps) => {
  const { userId: currentUserId } = useAuth();
  const { mutateAsync: createConversation, isPending } =
    useCreateConversation();

  const [avatarMedia, setAvatarMedia] = useState<MediaItem | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);

  const form = useForm({
    defaultValues: {
      isGroup: true,
      participants: [],
      admins: [],
      groupName: '',
    } as CreateConversationForm,
    validators: {
      onSubmit: ({ value }) => {
        const parsed = GroupConversationSchema.safeParse({
          ...value,
          groupName: value.groupName?.trim() ?? '',
        });
        if (parsed.success) return;
        return parsed.error.issues.map((i) => i.message);
      },
    },
    onSubmit: async ({ value, formApi }) => {
      if (!currentUserId) return;

      const payload: CreateConversationForm = {
        isGroup: true,
        participants: Array.from(
          new Set([currentUserId, ...(value.participants ?? [])])
        ),
        admins: [currentUserId],
        groupName: (value.groupName ?? '').trim(),
      };

      const promise = createConversation(
        {
          dto: payload,
          media: avatarMedia ?? undefined,
        },
        {
          onSuccess: () => {
            formApi.reset();
            setSelectedUsers([]);
            setSearch('');
            clearAvatar();
            handleInternalOpenChange(false);
          },
        }
      );

      toast.promise(promise, { loading: 'Dang tao nhom chat...' });
      await promise;
    },
  });

  useEffect(() => {
    if (!avatarMedia) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarMedia.file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarMedia]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(search.trim());
    }, 320);

    return () => clearTimeout(handle);
  }, [search]);

  const usersQ = useSearchUsers({ query: debouncedQuery, limit: 10 });
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    usersQ;

  const { ref: loadMoreRef, inView } = useInView({ rootMargin: '200px' });

  useEffect(() => {
    if (!debouncedQuery) return;
    if (!inView) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [debouncedQuery, inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    return data?.pages.flatMap((p) => p.data ?? []) ?? [];
  }, [data, debouncedQuery]);

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
    form.reset();
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

  const disableSubmit =
    isPending ||
    !currentUserId ||
    (form.state.values.participants?.length ?? 0) < 2 ||
    !form.state.values.groupName?.trim();

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
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup className="space-y-4">
              <div className="flex flex-col items-center gap-2">
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

              <form.Field
                name="groupName"
                validators={{
                  onChange: ({ value }) => {
                    if (!value?.trim()) {
                      return { message: 'Vui lòng nhập tên nhóm.' };
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const showError =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={showError}>
                      <FieldLabel>
                        Tên nhóm <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Input
                        placeholder="Ví dụ: Team UIT"
                        value={field.state.value ?? ''}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isPending}
                        aria-invalid={showError}
                      />
                      {showError && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                      <FieldDescription className="text-[11px]">
                        Tên nhóm giúp mọi người dễ nhận ra cuộc trò chuyện.
                      </FieldDescription>
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field
                name="participants"
                validators={{
                  onChange: ({ value }) => {
                    if ((value?.length ?? 0) < 2) {
                      return { message: 'Nhóm nên có ít nhất 2 thành viên khác (không tính bạn).' };
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const showError =  field.state.meta.isTouched && !field.state.meta.isValid;

                  const ids = field.state.value ?? [];

                  const availableSearchResults = searchResults.filter(
                    (u) => !ids.includes(u.id) && u.id !== currentUserId
                  );

                  const handleSelectUser = (user: UserDTO) => {
                    if (ids.includes(user.id)) return;
                    setSelectedUsers((prev) => [...prev, user]);
                    field.handleChange([...(ids ?? []), user.id]);
                    setSearch('');
                  };

                  const handleRemoveUser = (userId: string) => {
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== userId)
                    );
                    field.handleChange(ids.filter((id) => id !== userId));
                  };

                  return (
                    <Field data-invalid={showError}>
                      <FieldLabel>
                        Thêm thành viên <span className="text-red-500">*</span>
                      </FieldLabel>

                      <div className="space-y-3">
                        <Input
                          placeholder="Tim kiem theo ten, email..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isPending}
                          aria-invalid={showError}
                        />

                        {debouncedQuery && (
                          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-wide text-slate-500">
                              <span>Ket qua tim kiem</span>
                              {isFetchingNextPage && (
                                <span className="flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Dang tai...
                                </span>
                              )}
                            </div>
                            <div className="max-h-52 overflow-y-auto px-2 pb-2">
                              {isLoading ? (
                                <div className="px-3 py-6 text-sm text-slate-500 flex items-center gap-2 justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Dang tim kiem...
                                </div>
                              ) : availableSearchResults.length === 0 ? (
                                <div className="px-3 py-6 text-sm text-slate-500 text-center">
                                  Khong tim thay nguoi dung phu hop.
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {availableSearchResults.map((user) => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      onClick={() => handleSelectUser(user)}
                                      className="w-full text-left rounded-xl px-2 py-1.5 hover:bg-slate-100 disabled:opacity-60"
                                      disabled={isPending}
                                    >
                                      <Avatar
                                        userId={user.id}
                                        showName
                                        showStatus
                                        disableClick
                                      />
                                    </button>
                                  ))}

                                  <div ref={loadMoreRef} />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedUsers.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-sm font-medium text-slate-800">
                              Thanh vien da chon
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedUsers.map((user) => (
                                <Badge
                                  key={user.id}
                                  variant="secondary"
                                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                                >
                                  <Avatar userId={user.id} isSmall />
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

                        {showError && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        <FieldDescription className="text-[11px]">
                          Nhóm nên có ít nhất 2 thành viên khác (không tính
                          bạn).
                        </FieldDescription>
                      </div>
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

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
