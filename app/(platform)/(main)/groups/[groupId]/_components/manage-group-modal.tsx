/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupRole } from '@/models/group/enums/group-role.enum';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader } from '@/components/loader-componnet';
import { cn } from '@/lib/utils';

import { MediaItem } from '@/lib/types/media';
import { MediaType } from '@/models/social/enums/social.enum';
import type { GroupSettingDTO } from '@/models/group/groupSettingDTO';
 // chỉnh path đúng file hooks của bạn

import { PencilLine } from 'lucide-react';
import { useGetGroupSettings, useUpdateGroup, useUpdateGroupSettings } from '@/hooks/use-groups';

type ManageGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SectionKey = 'info' | 'settings';

export const ManageGroupDialog = ({
  open,
  onOpenChange,
}: ManageGroupDialogProps) => {
  const { group, role, can } = useGroupPermissionContext();

  const [activeSection, setActiveSection] = useState<SectionKey>('info');

  // ---- quyền ----
  const canEditInfo = can(GroupPermission.UPDATE_GROUP);
  const canViewSettings = can(GroupPermission.VIEW_SETTINGS);
  const canEditSettings = can(GroupPermission.UPDATE_GROUP_SETTINGS);
  const isOwner = role === GroupRole.OWNER; // nếu sau này cần xài thì dùng, còn không có thể xoá

  // ---- form info nhóm ----
  const [infoName, setInfoName] = useState(group?.name ?? '');
  const [infoDescription, setInfoDescription] = useState(
    group?.description ?? ''
  );

  // 📷 Cover: MediaItem + preview
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

  // ---- settings nhóm ----
  const shouldFetchSettings = open && !!group && canViewSettings;
  const { data: settingsData, isLoading: loadingSettings } =
    useGetGroupSettings(shouldFetchSettings ? group!.id : '');

  const [settings, setSettings] = useState<GroupSettingDTO | null>(null);

  useEffect(() => {
    if (settingsData) setSettings(settingsData);
  }, [settingsData]);

  // sync info khi mở dialog / đổi group
  useEffect(() => {
    if (!open || !group) return;
    setInfoName(group.name);
    setInfoDescription(group.description ?? '');
    setCoverMedia(null);
    setCoverPreview(null);
  }, [open, group?.id, group]);

  // ---- hooks mutation ----
  const { mutate: updateGroupMutate, isPending: savingInfo } = useUpdateGroup(
    group?.id ?? ''
  );

  const { mutate: updateSettingsMutate, isPending: savingSettings } =
    useUpdateGroupSettings(group?.id ?? '');

  // ---- handler chọn cover ----
  const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!canEditInfo) return;

    setCoverMedia({
      file,
      type: MediaType.IMAGE,
    });
  };

  const currentCoverUrl = useMemo(
    () => coverPreview || group?.coverImageUrl || '',
    [coverPreview, group?.coverImageUrl]
  );

  // ---- handler lưu info (name, desc, cover) ----
  const handleSaveInfo = () => {
    if (!group || !canEditInfo) return;

    const promise = new Promise<void>((resolve, reject) => {
      updateGroupMutate(
        {
          form: {
            name: infoName.trim(),
            description: infoDescription.trim() || undefined,
          } as any, // tuỳ UpdateGroupForm của bạn
          cover: coverMedia ?? undefined,
        },
        {
          onSuccess: () => {
            setCoverMedia(null);
            resolve();
          },
          onError: (error : any) => {
            reject(error);
          },
        }
      );
    });

    toast.promise(promise, {
      loading: 'Đang lưu thông tin nhóm...',
    });
  };

  // ---- handler lưu settings ----
  const handleSaveSettings = () => {
    if (!group || !canEditSettings || !settings) return;

    const promise = new Promise<void>((resolve, reject) => {
      updateSettingsMutate(
        {
          requiredPostApproval: settings.requiredPostApproval,
          maxMembers: settings.maxMembers,
          requireAdminApprovalToJoin: settings.requireAdminApprovalToJoin,
        },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error : any) => {
            reject(error);
          },
        }
      );
    });

    toast.promise(promise, {
      loading: 'Đang lưu cài đặt nhóm...',
    });
  };

  const sections: { key: SectionKey; label: string; description?: string }[] = [
    {
      key: 'info',
      label: 'Thông tin nhóm',
      description: 'Tên, mô tả, ảnh cover, quyền riêng tư',
    },
    {
      key: 'settings',
      label: 'Cài đặt nhóm',
      description: 'Quy tắc phê duyệt, giới hạn',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="px-6 pt-4 pb-2 border-b">
          <DialogTitle>Quản lý nhóm</DialogTitle>
        </DialogHeader>

        <div className="flex p-0">
          {/* Sidebar */}
          <aside className="w-36 border-r bg-muted/40 p-3 flex flex-col gap-1">
            {sections.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveSection(sec.key)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm',
                  'hover:bg-muted transition-colors',
                  activeSection === sec.key
                    ? 'bg-background shadow-sm font-medium'
                    : 'text-muted-foreground'
                )}
              >
                <div>{sec.label}</div>
                {sec.description && (
                  <div className="text-[11px] text-muted-foreground">
                    {sec.description}
                  </div>
                )}
              </button>
            ))}
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'info' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold">Thông tin nhóm</h3>
                  <p className="text-xs text-muted-foreground">
                    Thông tin cơ bản hiển thị cho mọi người.
                  </p>
                  {!canEditInfo && (
                    <p className="mt-1 text-[11px] text-amber-600">
                      Bạn chỉ có quyền xem thông tin nhóm.
                    </p>
                  )}
                </div>

                <div className="space-y-4 max-w-2xl">
                  {/* Cover */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Ảnh cover</label>
                    <div className="relative group h-40 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {currentCoverUrl ? (
                        <Image
                          src={currentCoverUrl}
                          alt="Group cover"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Nhóm chưa có ảnh cover
                        </span>
                      )}

                      {canEditInfo && (
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById('group-cover-input')
                              ?.click()
                          }
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <PencilLine className="w-5 h-5 text-white" />
                          <span className="text-xs text-white">
                            Thay đổi ảnh cover
                          </span>
                        </button>
                      )}
                    </div>

                    <input
                      id="group-cover-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverInputChange}
                      disabled={!canEditInfo}
                    />

                    {coverMedia && (
                      <p className="text-[11px] text-muted-foreground">
                        Đã chọn: {coverMedia.file.name}
                      </p>
                    )}
                  </div>

                  {/* Tên nhóm */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Tên nhóm</label>
                    <Input
                      value={infoName}
                      onChange={(e) => setInfoName(e.target.value)}
                      readOnly={!canEditInfo}
                    />
                  </div>

                  {/* Mô tả */}
                  <div className="space-y-1.5 w-[300px] ">
                    <label className="text-sm font-medium">Mô tả</label>
                    <Textarea
                      value={infoDescription}
                      onChange={(e) => setInfoDescription(e.target.value)}
                      readOnly={!canEditInfo}
                      className="max-h-[90px]"
                    />
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="font-medium text-foreground">
                      Quyền riêng tư
                    </div>
                    <div>
                      Hiện tại:{' '}
                      <b>
                        {group?.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                      </b>
                    </div>
                    <p className="text-xs">
                      Thay đổi quyền riêng tư (nếu được phép) bạn có thể
                      implement thêm ở đây.
                    </p>
                  </div>
                </div>

                {canEditInfo && (
                  <div className="pt-2 justify-end flex">
                    <Button onClick={handleSaveInfo} disabled={savingInfo}>
                      {savingInfo ? 'Đang lưu...' : 'Lưu thông tin'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold">Cài đặt nhóm</h3>
                  <p className="text-xs text-muted-foreground">
                    Điều chỉnh cách thành viên tham gia và đăng bài trong nhóm.
                  </p>
                </div>

                {loadingSettings && (
                  <div className="flex items-center justify-center py-8">
                    <Loader size={32} />
                  </div>
                )}

                {!loadingSettings && !settings && (
                  <p className="text-sm text-muted-foreground">
                    Không thể tải cài đặt nhóm.
                  </p>
                )}

                {settings && (
                  <>
                    <div className="space-y-4 max-w-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium">
                            Yêu cầu phê duyệt bài đăng
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Nếu bật, bài đăng mới cần admin/mod phê duyệt trước
                            khi hiển thị.
                          </p>
                        </div>
                        <Switch
                          checked={settings.requiredPostApproval}
                          onCheckedChange={(checked: any) =>
                            canEditSettings &&
                            setSettings((prev) =>
                              prev
                                ? { ...prev, requiredPostApproval: checked }
                                : prev
                            )
                          }
                          disabled={!canEditSettings}
                        />
                      </div>

                      {/* <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium">
                            Cho phép thành viên mời bạn
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Nếu bật, thành viên có thể mời người khác tham gia
                            nhóm.
                          </p>
                        </div>
                        <Switch
                          checked={settings.allowInvites}
                          onCheckedChange={(checked: any) =>
                            canEditSettings &&
                            setSettings((prev) =>
                              prev ? { ...prev, allowInvites: checked } : prev
                            )
                          }
                          disabled={!canEditSettings}
                        />
                      </div> */}

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium">
                            Yêu cầu admin phê duyệt yêu cầu tham gia
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Nếu bật, yêu cầu tham gia cần admin/phê duyệt thủ
                            công.
                          </p>
                        </div>
                        <Switch
                          checked={settings.requireAdminApprovalToJoin}
                          onCheckedChange={(checked: any) =>
                            canEditSettings &&
                            setSettings((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    requireAdminApprovalToJoin: checked,
                                  }
                                : prev
                            )
                          }
                          disabled={!canEditSettings}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium">
                              Giới hạn số thành viên
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Đặt giới hạn tối đa số lượng thành viên của nhóm.
                            </p>
                          </div>
                          <div>
                            <Input
                              type="number"
                              min={0}
                              value={settings.maxMembers ?? 0}
                              onChange={(e) => {
                                if (!canEditSettings) return;
                                const v = Number(e.target.value) || 0;
                                setSettings((prev) =>
                                  prev ? { ...prev, maxMembers: v } : prev
                                );
                              }}
                              readOnly={!canEditSettings}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {canEditSettings && (
                      <div className="pt-2 justify-end flex">
                        <Button
                          onClick={handleSaveSettings}
                          disabled={savingSettings}
                        >
                          {savingSettings ? 'Đang lưu...' : 'Lưu cài đặt'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};
