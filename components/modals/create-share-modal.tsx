'use client'
import { useCreateShareModal } from "@/store/use-post-modal"
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Avatar } from "../avatar";
import { useAuth } from "@clerk/nextjs";
import { Select } from "../ui/select";
import { Share } from "next/font/google";
import SharedPostPreview from "../post/share-post-review";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

export const CreateShareModal = () => {
  const {userId} = useAuth()
  const {isOpen, closeModal, data } = useCreateShareModal();
  const [content, setContent] = useState('');
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      {/* Dialog Content */}
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-lg font-semibold text-center">
            Chia sẻ bài viết
          </DialogTitle>
        </DialogHeader>

        {/* Main Share UI */}
        <div className="flex flex-row items-start gap-4 p-4">
          <Avatar userId={userId as string} hasBorder isLarge />

          <div className="flex-1 space-y-2">
            {/* Audience Select */}
            {/* <Select
              onValueChange={(value) => setAudience(value as Audience)}
              defaultValue={Audience.PUBLIC}
            >
              <SelectTrigger className="w-36 h-9 text-sm bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                {audience === Audience.PUBLIC && (
                  <Globe className="w-4 h-4 text-gray-600" />
                )}
                {audience === Audience.FRIENDS && (
                  <Users className="w-4 h-4 text-gray-600" />
                )}
                {audience === Audience.ONLY_ME && (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
                <SelectValue placeholder="Privacy" />
              </SelectTrigger>

              <SelectContent position="popper" sideOffset={4}>
                <SelectItem value={Audience.PUBLIC}>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value={Audience.FRIENDS}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span>Friends</span>
                  </div>
                </SelectItem>
                <SelectItem value={Audience.ONLY_ME}>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span>Only Me</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select> */}

            {/* Textarea */}
            <textarea
              onChange={(e) => setContent(e.target.value)}
              value={content}
              placeholder="Say something about this..."
              className="disabled:opacity-80 peer resize-none mt-2 w-full min-h-[60px] ring-0 outline-none text-sm p-2 placeholder-gray-400 text-gray-700"
            />
          </div>
        </div>
        {data && (
          <ScrollArea className="max-h-[70vh]">
            {/* Shared Content Preview */}
            <SharedPostPreview post={data} />
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <Button>Chia sẻ</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}