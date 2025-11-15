'use client';
import { useGetUser, useUpdateUser } from '@/hooks/use-user-hook';
import { ProfileUpdateForm, ProfileUpdateSchema } from '@/models/user/userDTO';
import { useProfileModal } from '@/store/use-profile-modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormInput } from '../form/form-input';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { FormTextarea } from '../form/form-textarea';
import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export const ProfileModal = () => {
  const profileModal = useProfileModal();
  const { data: fetchedUser } = useGetUser(profileModal.id as string);

  const { mutateAsync: updateUser, isPending } = useUpdateUser(
    profileModal.id as string
  );

  const { user } = useUser();

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      avatarUrl: fetchedUser?.avatarUrl ?? '',
      coverImageUrl: fetchedUser?.coverImageUrl ?? '',
      firstName: fetchedUser?.firstName ?? '',
      lastName: fetchedUser?.lastName ?? '',
      bio: fetchedUser?.bio ?? '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (fetchedUser) {
      form.reset({
        firstName: fetchedUser.firstName ?? '',
        lastName: fetchedUser.lastName ?? '',
        bio: fetchedUser.bio ?? '',
      });
    }
  }, [fetchedUser, form]);

    const onSubmit = async (values: ProfileUpdateForm) => {
      
      const promise = updateUser(values, {
        onSuccess: () => {
          profileModal.onClose();
          user?.reload();
        },
      });
      toast.promise(promise, {
        loading: 'Đang cập nhật hồ sơ...',
      });
    };


  return (
    <Dialog open={profileModal.isOpen} onOpenChange={profileModal.onClose}>
      <DialogContent className="max-w-md flex flex-col">
        <DialogHeader className="mb-6 flex w-full items-center justify-center">
          <DialogTitle className="text-center text-gray-900 text-2xl font-bold">
            Chỉnh sửa
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col items-start gap-3">
            <label
              htmlFor="avatar"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Avatar
              <Controller
                name="avatarUrl"
                control={form.control}
                render={({ field }) => (
                  <>
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      id="avatar"
                      className="w-full p-3 border border-gray-200 rounded-lg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file); // lưu file object vào form state
                      }}
                    />
                    <div className="group/profile relative">
                      <Image
                        src={
                          field.value instanceof File
                            ? URL.createObjectURL(field.value) // preview file mới chọn
                            : fetchedUser?.avatarUrl ||
                              '/images/placeholder.png' // fallback ảnh cũ
                        }
                        alt="avatar"
                        width={100}
                        height={100}
                        className="object-cover rounded-full mt-2"
                      />

                      <div className="absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-full items-center justify-center">
                        <Pencil className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </>
                )}
              />
            </label>
          </div>
          <div className="flex flex-col items-start gap-3">
            <label
              htmlFor="cover-image"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Cover Image
              <Controller
                name="coverImageUrl"
                control={form.control}
                render={({ field }) => (
                  <>
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      id="cover-image"
                      className="w-full p-3 border border-gray-200 rounded-lg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file); // lưu file object vào form state
                      }}
                    />
                    <div className="group/cover relative">
                      <Image
                        src={
                          field.value instanceof File
                            ? URL.createObjectURL(field.value) // preview file mới chọn
                            : fetchedUser?.coverImageUrl ||
                              '/images/placeholder-bg.png' // fallback ảnh cũ
                        }
                        alt="cover image"
                        width={250}
                        height={100}
                        className="object-cover rounded-lg mt-2"
                      />

                      <div className="absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center">
                        <Pencil className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </>
                )}
              />
            </label>
          </div>

          <FormInput
            label="Họ và tên đệm"
            id="lastName"
            placeholder="Nhạp họ và tên đệm"
            defaultValue={fetchedUser?.lastName}
            errors={form.formState.errors}
            {...form.register('lastName')}
          />

          <FormInput
            label="Tên"
            id="firstName"
            placeholder="Nhập tên"
            defaultValue={fetchedUser?.firstName}
            errors={form.formState.errors}
            {...form.register('firstName')}
          />

          <FormTextarea
            label="Biography"
            id="bio"
            placeholder="Viết gì đó về bạn..."
            defaultValue={fetchedUser?.bio}
            errors={form.formState.errors}
            {...form.register('bio')}
          />
          <DialogFooter className="flex justify-end space-x-3 pt-6">
            <Button
              disabled={!form.formState.isDirty || isPending}
              type="submit"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
