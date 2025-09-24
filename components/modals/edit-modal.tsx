'use client';
import { useGetUser, useUpdateUser } from '@/hooks/use-user-hook';
import { ProfileUpdateForm, ProfileUpdateSchema } from '@/models/user/userDTO';
import { useEditModal } from '@/store/use-edit-modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormInput } from '../form/form-input';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useEffect } from 'react';

export const EditModal = () => {
  const editModal = useEditModal();
  const { data: fetchedUser } = useGetUser(editModal.id as string);

  const { mutateAsync: updateUser, isPending } = useUpdateUser(
    editModal.id as string
  );

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      firstName: fetchedUser?.firstName ?? '',
      lastName: fetchedUser?.lastName ?? '',
      bio: fetchedUser?.bio ?? '',
    },
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
    await updateUser(values, {
      onSuccess: () => editModal.onClose(),
    });
  };

  return (
    <Dialog open={editModal.isOpen} onOpenChange={editModal.onClose}>
      <DialogContent className="max-w-md flex flex-col">
        <DialogHeader className="mb-5 flex w-full items-center justify-center">
          <DialogTitle className="text-center text-2xl font-bold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* <ImageUpLoad>

          </ImageUpLoad> */}
          <FormInput
            id="firstName"
            placeholder="Enter first name"
            defaultValue={fetchedUser?.firstName}
            errors={form.formState.errors}
            {...form.register('firstName')}
          />

          <FormInput
            id="lastName"
            placeholder="Enter last name"
            defaultValue={fetchedUser?.lastName}
            errors={form.formState.errors}
            {...form.register('lastName')}
          />

          <FormInput
            id="bio"
            placeholder="Write something about yourself"
            defaultValue={fetchedUser?.bio}
            errors={form.formState.errors}
            {...form.register('bio')}
          />
          <DialogFooter>
            <Button disabled={isPending} className="w-full" type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
