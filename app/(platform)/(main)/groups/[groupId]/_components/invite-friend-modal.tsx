'use client';

import { useState } from 'react';
import { MdGroupAdd } from 'react-icons/md';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { toast } from 'sonner';

export const GroupInviteDialog = () => {
  const { group } = useGroupPermissionContext();
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    // tuỳ bạn define format link invite
    return `${window.location.origin}/groups/${group?.id}`;
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Đã copy link mời vào clipboard');
    } catch {
      toast.error('Không thể copy link, vui lòng thử lại');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MdGroupAdd className="mr-1.5 h-4 w-4" />
          Mời bạn bè
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mời bạn bè vào {group?.name}</DialogTitle>
          <DialogDescription>
            Gửi link dưới đây cho bạn bè để họ có thể tham gia nhóm. Sau này bạn
            có thể bổ sung danh sách bạn, ô search, checkbox… nếu cần.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Link mời</label>
          <div className="flex gap-2">
            <Input
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              readOnly
            />
            <Button type="button" onClick={handleCopyLink}>
              Copy
            </Button>
          </div>
        </div>

        {/* TODO: khu vực list bạn bè / search user nếu sau này bạn gắn API */}
      </DialogContent>
    </Dialog>
  );
};
