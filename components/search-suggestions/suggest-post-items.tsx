import { FileText } from 'lucide-react';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';

export function SuggestionPostItem({
  post,
  onPick,
}: {
  post: PostSnapshotDTO;
  onPick: (post: PostSnapshotDTO) => void;
}) {
  const preview = post.content?.trim() || '(No content)';
  const emotion = post.mainEmotion ? ` • ${post.mainEmotion}` : '';
  const media = post.mediaRemaining ? ` • +${post.mediaRemaining}` : '';

  return (
    <button
      type="button"
      onClick={() => onPick(post)}
      className="w-full px-3 py-2 text-left hover:bg-muted/60 transition
                 flex items-center gap-3"
    >
      {/* ICON cố định */}
      <div className="shrink-0 text-muted-foreground">
        <FileText className="h-4 w-4" />
      </div>

      {/* CONTENT */}
      <div className="min-w-0 flex-1">
        {/* truncate 1 dòng */}
        <div className="text-sm font-medium line-clamp-2">{preview}</div>

        {/* meta */}
        <div className="text-xs text-muted-foreground truncate">
          {post.audience}
          {emotion}
          {media}
        </div>
      </div>
    </button>
  );
}
