'use client';

import { useAuth } from '@clerk/nextjs';
import { CalendarDays, Globe, Lock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { HiMiniUserGroup } from 'react-icons/hi2';
import { IoMdSettings } from 'react-icons/io';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { useImageViewerModal } from '@/store/use-image-viewer-modal';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import { format as formatDate } from 'date-fns';

// shadcn ui
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

// import các api group (chỉnh path cho đúng với file của bạn)
import {
  deleteGroup,
  leaveGroup,
  requestToJoinGroup,
} from '@/lib/actions/group/group-action';
import { FaKey } from 'react-icons/fa';
import { LuSettings2 } from 'react-icons/lu';
import { MdDeleteForever } from 'react-icons/md';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { TbMessageReportFilled } from 'react-icons/tb';
import { GroupInviteDialog } from './invite-friend-modal';
import { ManageGroupDialog } from './manage-group-modal';
import { GroupReportDialog } from './report-modal';

export const GroupHeader = () => {
  const { group, role, can } = useGroupPermissionContext();
  const { getToken } = useAuth();
  const router = useRouter();
  const { onOpen: openImageViewer } = useImageViewerModal();

  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const formattedCreatedAt = useMemo(() => {
    if (!group?.createdAt) return null;
    return formatDate(new Date(group.createdAt), 'dd/MM/yyyy');
  }, [group?.createdAt]);

  if (!group) return null;

  const isPublic = group.privacy === 'PUBLIC';
  const isPrivate = group.privacy === 'PRIVATE';

  const isMember = !!role;
  const isOwner = role === GroupRole.OWNER;

  const handleJoinGroup = async () => {
    try {
      setIsJoining(true);
      const token = await getToken();
      if (!token)
        throw new Error('Không tìm thấy token, vui lòng đăng nhập lại.');

      await requestToJoinGroup(token, group.id);
      toast.success('Đã gửi yêu cầu tham gia nhóm');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Không thể gửi yêu cầu tham gia nhóm');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setIsLeaving(true);
      const token = await getToken();
      if (!token)
        throw new Error('Không tìm thấy token, vui lòng đăng nhập lại.');

      await leaveGroup(token, group.id);
      toast.success('Bạn đã rời nhóm');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Không thể rời nhóm');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setIsDeleting(true);
      const token = await getToken();
      if (!token)
        throw new Error('Không tìm thấy token, vui lòng đăng nhập lại.');

      const ok = await deleteGroup(token, group.id);
      if (ok) {
        toast.success('Nhóm đã được xóa');
      } else {
        toast.success('Nhóm đã được xóa'); // BE trả boolean, tuỳ bạn xử lý
      }
      setDeleteOpen(false);
      router.replace('/groups');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Không thể xóa nhóm');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Cover */}
        <div className="relative h-70 w-full border-b border-slate-200 bg-slate-200">
          {group.coverImageUrl ? (
            <Image
              src={group.coverImageUrl}
              alt="Cover Image"
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-r from-slate-200 via-slate-100 to-slate-200" />
          )}
          {group.coverImageUrl && (
            <button
              type="button"
              onClick={() => openImageViewer(group.coverImageUrl, 'Ảnh bìa')}
              className="absolute inset-0 cursor-zoom-in"
              aria-label="Xem ảnh bìa"
            />
          )}
        </div>

        {/* Content */}
        <div className="relative px-6 pb-6 md:px-8">
          <div className="mt-3 sm:-mt-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <button
                type="button"
                onClick={() =>
                  openImageViewer(
                    group.avatarUrl || '/images/placeholder.png',
                    'Ảnh đại diện'
                  )
                }
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-md ring-1 ring-black/5 cursor-zoom-in sm:h-26 sm:w-26"
                aria-label="Xem ảnh đại diện"
              >
                <Image
                  src={group.avatarUrl || '/images/placeholder.png'}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </button>

              <div className="space-y-1 pb-1 pt-2 sm:pt-0">
                <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                  {group.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    {isPublic && <Globe className="h-4 w-4" />}
                    {isPrivate && <Lock className="h-4 w-4" />}
                    {isPublic
                      ? 'Công khai'
                      : isPrivate
                        ? 'Riêng tư'
                        : 'Không rõ'}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <HiMiniUserGroup className="h-4 w-4" />
                    {group.members ?? 0} thành viên
                  </span>

                  {formattedCreatedAt && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      Lập vào {formattedCreatedAt}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mời bạn bè: chỉ cho member trở lên */}
              {isMember && <GroupInviteDialog />}

              {/* Join / Joined */}
              {!isMember ? (
                <Button onClick={handleJoinGroup} disabled={isJoining}>
                  {isJoining ? 'Đang gửi yêu cầu...' : 'Tham gia nhóm'}
                </Button>
              ) : isOwner ? (
                <Button variant="outline" disabled className="cursor-default">
                  <FaKey />
                  Chủ nhóm
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <HiMiniUserGroup className="mr-1.5 h-4 w-4" />
                      Đã tham gia
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={handleLeaveGroup}
                      disabled={isLeaving} // tùy rule: owner có được rời nhóm không?
                    >
                      <RiLogoutBoxLine className="text-red-600" />
                      {isLeaving ? 'Đang rời nhóm...' : 'Rời nhóm'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Settings dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <IoMdSettings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="cursor-pointer">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setReportOpen(true)}
                  >
                    <TbMessageReportFilled className="text-rose-600" />
                    Báo cáo nhóm
                  </DropdownMenuItem>
                  {can(GroupPermission.VIEW_SETTINGS) && (
                    <DropdownMenuItem onClick={() => setManageOpen(true)}>
                      <LuSettings2 />
                      Quản lý cài đặt nhóm
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <MdDeleteForever className='text-red-600' />
                        Xóa nhóm
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 px-4 py-3">
            <p className="text-sm leading-relaxed text-slate-600">
              {group.description || 'Chưa có mô tả'}
            </p>
          </div>
        </div>
      </div>


      {/* AlertDialog xác nhận xóa nhóm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tất cả bài viết, thành viên và
              dữ liệu liên quan đến nhóm <b>{group.name}</b> sẽ bị xóa vĩnh
              viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa nhóm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ManageGroupDialog open={manageOpen} onOpenChange={setManageOpen} />
      <GroupReportDialog open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
};
