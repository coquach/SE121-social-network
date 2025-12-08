'use client';
import { Button } from '@/components/ui/button';
import { useConversation } from '@/hooks/use-conversation';
import { useSendMessage } from '@/hooks/use-message';
import { MediaItem } from '@/lib/types/media';
import { MediaType } from '@/models/social/enums/social.enum';
import { useReplyStore } from '@/store/use-chat-store';
import EmojiPicker from 'emoji-picker-react';
import { SendHorizonal, X } from 'lucide-react';
import Image from 'next/image';
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { MdOutlineAttachFile, MdOutlineEmojiEmotions } from 'react-icons/md';
import { toast } from 'sonner';
import { MessageReply } from './message-reply';

const MAX_MEDIA = 5;

export const FormInput = () => {
  const { conversationId } = useConversation();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [previews, setPreviews] = useState<
    { file: File; type: MediaType; preview: string }[]
  >([]);

  const { replyTo, setReplyTo } = useReplyStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 👉 ref cho textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- AUTO RESIZE TEXTAREA ---
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto'; // reset trước
    const maxHeight = 160; // ~ 10rem, tuỳ anh chỉnh
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  useEffect(() => {
    // chạy 1 lần khi mount để set chiều cao ban đầu
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, []);

  // preview media
  useEffect(() => {
    if (media.length === 0) {
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
      setPreviews([]);
      return;
    }

    const nextPreviews = media.map((item) => ({
      ...item,
      preview: URL.createObjectURL(item.file),
    }));

    const oldPreviews = previews;
    setPreviews(nextPreviews);

    return () => {
      oldPreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const mapped: MediaItem[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        mapped.push({ file, type: MediaType.IMAGE });
      } else if (file.type.startsWith('video/')) {
        mapped.push({ file, type: MediaType.VIDEO });
      } else {
        toast.error('Chỉ hỗ trợ ảnh và video.');
      }
    }

    setMedia((prev) => {
      const total = prev.length + mapped.length;
      if (total > MAX_MEDIA) {
        toast.error(`Bạn không thể tải nhiều hơn ${MAX_MEDIA} tệp.`);
        return prev;
      }
      return [...prev, ...mapped];
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const { sendMessage, isPending } = useSendMessage();

  const handleSend = async () => {
    if (!content.trim() && media.length === 0) return;
    await sendMessage({
      conversationId,
      content: content.trim(),
      media,
      replyTo: replyTo?._id,
    });
    setContent('');
    setMedia([]);
    setReplyTo(null);
    // reset lại chiều cao textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isPending && (content.trim() || media.length > 0)) {
        void handleSend();
      }
    }
  };

  const handleRemoveMediaAt = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const isDisabled = (!content.trim() && media.length === 0) || isPending;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiModal = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleEmojiClick = (emoji: { emoji: string }) => {
    setContent((prev) => {
      const next = prev + emoji.emoji;
      // resize khi thêm emoji
      if (textareaRef.current) {
        autoResize(textareaRef.current);
      }
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('#emoji-open')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 bg-white/80 backdrop-blur border-t flex items-end gap-2 w-full">
      {/* Emoji + đính kèm bên trái */}
      <div className="flex items-end gap-4 relative">
        <MdOutlineEmojiEmotions
          className="h-9 w-9 cursor-pointer text-sky-500 hover:text-sky-300"
          id="emoji-open"
          onClick={handleEmojiModal}
        />
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-40" ref={emojiPickerRef}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-300 bg-white shadow-sm hover:bg-neutral-100 transition"
          >
            <MdOutlineAttachFile className="h-4 w-4 text-sky-300" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            hidden
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Textarea + preview */}
      <div className="flex-1 flex flex-col gap-2">
        {replyTo && (
          <div className="flex items-center gap-2">
            <MessageReply replyTo={replyTo} />
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-400 hover:text-gray-200 hover:bg-neutral-400 rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          id="message"
          rows={1}
          autoComplete="message"
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={handleKeyDown}
          className="overflow-hidden max-h-40 text-black font-light px-4 py-2 border bg-neutral-100 w-full rounded-lg focus:outline-none resize-none"
        />

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-xl bg-neutral-50 px-2 py-2">
            {previews.map((item, i) => (
              <div
                key={`${item.preview}-${i}`}
                className="group relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200 bg-black/5"
              >
                {item.type === MediaType.IMAGE ? (
                  <Image
                    src={item.preview}
                    alt=""
                    height={80}
                    width={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={item.preview}
                    className="h-full w-full object-cover"
                    muted
                  />
                )}

                <Button
                  variant="ghost"
                  onClick={() => handleRemoveMediaAt(i)}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 group-hover:flex"
                >
                  <X className="h-3 w-3 text-white" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nút send bên phải */}
      <Button
        onClick={handleSend}
        disabled={isDisabled}
        className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white"
      >
        <SendHorizonal size={18} />
      </Button>
    </div>
  );
};
