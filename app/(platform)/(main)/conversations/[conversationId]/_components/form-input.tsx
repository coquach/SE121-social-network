'use client';
import { Button } from '@/components/ui/button';
import { useConversation } from '@/hooks/use-conversation';
import { useSendMessage } from '@/hooks/use-message';
import { MediaItem } from '@/lib/types/media';
import { MediaType } from '@/models/social/enums/social.enum';
import { useReplyStore } from '@/store/use-chat-store';
import { ImageIcon, SendHorizonal, VideoIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
    // tạo preview cho file mới chưa có URL
    const newPreviews = media.map((item) => {
      const existing = previews.find((p) => p.file === item.file);
      if (existing) return existing; // giữ URL cũ nếu có
      return {
        ...item,
        preview: URL.createObjectURL(item.file),
      };
    });

    setPreviews(newPreviews);

    // cleanup cho file bị remove
    return () => {
      previews.forEach((p) => {
        if (!media.some((m) => m.file === p.file)) {
          URL.revokeObjectURL(p.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  const handleFiles = useCallback((files: File[], type: MediaType) => {
    const mapped = files.map((file) => ({ file, type }));

    setMedia((prev) => {
      const total = prev.length + mapped.length;
      if (total > MAX_MEDIA) {
        toast.error(`Bạn không thể tải nhiều hơn ${MAX_MEDIA} tệp.`);
        return prev;
      }
      return [...prev, ...mapped];
    });
  }, []);

  const { sendMessage, isPending } = useSendMessage();
  const handleSend = async () => {
    if (!content.trim() && media.length === 0) return;
    await sendMessage({ conversationId, content: content.trim(), media, replyTo: replyTo?._id });
    setContent('');
    setMedia([]);
    setReplyTo(null);
  }
  console.log('Content:', content);
  return (
    <div className="py-4 px-4 bg-white border-t flex items-end gap-2 w-full">
      {/* Media buttons bên trái */}
      <div className="flex items-end gap-4">
        <label
          htmlFor="images"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 cursor-pointer transition"
        >
          <ImageIcon className="size-5" />
        </label>
        <input
          type="file"
          id="images"
          accept="image/*"
          hidden
          multiple
          onChange={(e) => {
            if (!e.target.files) return;
            handleFiles(Array.from(e.target.files), MediaType.IMAGE);
          }}
        />

        <label
          htmlFor="videos"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 cursor-pointer transition"
        >
          <VideoIcon className="size-5" />
        </label>
        <input
          type="file"
          id="videos"
          accept="video/*"
          hidden
          multiple
          onChange={(e) => {
            if (!e.target.files) return;
            handleFiles(Array.from(e.target.files), MediaType.VIDEO);
          }}
        />
      </div>

      {/* Textarea ở giữa + preview bên dưới */}
      <div className="flex-1 flex flex-col gap-2">
        {
          replyTo && (
           <div className='flex items-center gap-2'>
            <MessageReply replyTo={replyTo} />
            <button onClick={() => setReplyTo(null)} className='text-gray-400 hover:text-gray-200 hover:bg-neutral-400 rounded-full p-1'>
              <X size={16} />
            </button>
           </div>
          )
        }
        <textarea
          id="message"
          rows={1}
          autoComplete="message"
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-black font-light px-4 py-2 border bg-neutral-100 w-full rounded-full focus:outline-none resize-none "
        />
        

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-2">
            {previews.map((item, i) => (
              <div key={i} className="relative group">
                {item.type === MediaType.IMAGE ? (
                  <Image
                    src={item.preview}
                    alt=""
                    height={100}
                    width={100}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <video
                    src={item.preview}
                    className="rounded-lg object-cover h-24 w-24"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setMedia(media.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hidden group-hover:flex"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Button send bên phải */}
      <Button
        onClick={handleSend}
        disabled={(!content.trim() && media.length === 0) || isPending}
        className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white"
      >
        <SendHorizonal size={18} />
      </Button>
    </div>
  );
};
