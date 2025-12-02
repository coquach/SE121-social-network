/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { GroupSchema, CreateGroupForm } from '@/models/group/groupDTO';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { MediaItem } from '@/lib/types/media';
import { MediaType } from '@/models/social/enums/social.enum';
import { PencilLine, UserCircle2, ImageIcon, X } from 'lucide-react';
import { useCreateGroup } from '@/hooks/use-groups';

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateGroupDialog = ({
  open,
  onOpenChange,
}: CreateGroupDialogProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(GroupSchema),
    defaultValues: {
      name: '',
      description: '',
      avatarUrl: '',
      coverImageUrl: '',
      privacy: GroupPrivacy.PUBLIC,
      rules: '',
      groupCategoryId: undefined,
    },
    mode: 'onChange',
  });

  const { mutate: createGroupMutate, isPending } = useCreateGroup();

  // -------- Avatar media & preview --------
  const [avatarMedia, setAvatarMedia] = useState<MediaItem | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarMedia) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarMedia.file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarMedia]);

  // -------- Cover media & preview --------
  const [coverMedia, setCoverMedia] = useState<MediaItem | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!coverMedia) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverMedia.file);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverMedia]);

  const privacyValue = watch('privacy');

  const resetAll = () => {
    reset();
    setAvatarMedia(null);
    setAvatarPreview(null);
    setCoverMedia(null);
    setCoverPreview(null);
  };

  const handleInternalOpenChange = (o: boolean) => {
    if (!o) {
      resetAll();
    }
    onOpenChange(o);
  };

  const onSubmit = (values: CreateGroupForm) => {
    const payload: CreateGroupForm = {
      ...values,
      description: values.description?.trim() || undefined,
      rules: values.rules?.trim() || undefined,
      coverImageUrl: values.coverImageUrl?.trim() || undefined,
      groupCategoryId: values.groupCategoryId?.trim() || undefined,
    };

    const promise = new Promise<void>((resolve, reject) => {
      createGroupMutate(
        {
          form: payload,
          avatar: avatarMedia ?? undefined,
          cover: coverMedia ?? undefined,
        },
        {
          onSuccess: () => {
            resetAll();
            onOpenChange(false);
            resolve();
          },
          onError: (err: any) => {
            console.error(err);
            reject(
              err?.message ?? new Error('Không thể tạo nhóm, vui lòng thử lại')
            );
          },
        }
      );
    });

    toast.promise(promise, {
      loading: 'Đang tạo nhóm...',
      success: 'Tạo nhóm thành công',
      error: 'Không thể tạo nhóm, vui lòng thử lại',
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMedia({
      file,
      type: MediaType.IMAGE,
    });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverMedia({
      file,
      type: MediaType.IMAGE,
    });
  };

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
    
        <DialogHeader className="px-6 pt-4 pb-2 border-b flex flex-col items-center">
          <DialogTitle>Tạo nhóm mới</DialogTitle>
          <DialogDescription>
            Tạo một cộng đồng mới để kết nối mọi người, chia sẻ nội dung và
            tương tác.
          </DialogDescription>
        </DialogHeader>

 
        <div className="px-6 pb-6 pt-3 overflow-y-auto">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Avatar + Cover preview giống manage modal */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <UserCircle2 className="w-16 h-16 text-gray-400" />
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('group-avatar-input')?.click()
                      }
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <PencilLine className="w-4 h-4 text-white" />
                      <span className="text-[11px] text-white">
                        Chọn avatar
                      </span>
                    </button>
                  </div>
                  <input
                    id="group-avatar-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-[11px] text-muted-foreground text-center max-w-40">
                    Nên dùng ảnh vuông, tối thiểu 200×200px.
                  </p>
                </div>

                {/* Cover */}
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Ảnh cover</label>
                  <div className="relative group h-32 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {coverPreview ? (
                      <Image
                        src={coverPreview}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-xs">
                          Chưa có ảnh cover — chọn ảnh để làm nổi bật nhóm
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('group-cover-input')?.click()
                      }
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PencilLine className="w-4 h-4 text-white" />
                      <span className="text-[11px] text-white">
                        Chọn ảnh cover
                      </span>
                    </button>
                  </div>
                  <input
                    id="group-cover-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                  {coverPreview && (
                    <button
                      type="button"
                      onClick={() => setCoverMedia(null)}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                      Bỏ chọn ảnh cover
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Tỉ lệ khuyến nghị 16:9, dung lượng &lt; 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Tên nhóm */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Tên nhóm
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <Input
                placeholder="Ví dụ: Lập trình Next.js Việt Nam"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Mô tả */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                placeholder="Giới thiệu ngắn gọn về mục đích, nội dung và đối tượng của nhóm..."
                {...register('description')}
                className="min-h-[100px] resize-none whitespace-pre-wrap"
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Privacy + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Privacy */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Quyền riêng tư
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <Select
                  value={privacyValue}
                  onValueChange={(v) =>
                    setValue('privacy', v as CreateGroupForm['privacy'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quyền riêng tư" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GroupPrivacy.PUBLIC}>
                      Công khai
                    </SelectItem>
                    <SelectItem value={GroupPrivacy.PRIVATE}>
                      Riêng tư
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.privacy && (
                  <p className="text-xs text-red-500">
                    {errors.privacy.message as string}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Công khai: mọi người đều có thể tìm và xem nội dung nhóm.
                  Riêng tư: chỉ thành viên mới xem được.
                </p>
              </div>

              {/* Category
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Danh mục nhóm</label>
                <Input
                  placeholder="UUID danh mục (tạm thời)"
                  {...register('groupCategoryId')}
                />
                {errors.groupCategoryId && (
                  <p className="text-xs text-red-500">
                    {errors.groupCategoryId.message as string}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Sau này bạn có thể thay input này bằng dropdown danh mục từ
                  API.
                </p>
              </div> */}
            </div>

            {/* Rules */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nội quy nhóm</label>
              <Textarea
                placeholder="Đặt một vài quy tắc cơ bản để mọi người tuân thủ..."
                {...register('rules')}
                className="min-h-[120px] resize-none whitespace-pre-wrap"
              />
              {errors.rules && (
                <p className="text-xs text-red-500">{errors.rules.message}</p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Ví dụ: không spam, không xúc phạm cá nhân, tuân thủ nội quy nền
                tảng,...
              </p>
            </div>

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
              <Button type="submit" disabled={isPending || !isDirty}>
                {isPending ? 'Đang tạo...' : 'Tạo nhóm'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
