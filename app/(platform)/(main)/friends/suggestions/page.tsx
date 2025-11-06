import { FriendSuggestions } from './friend-suggestions';

export default function FriendsSuggestionsPage() {
  return (
    <div className="h-full w-full p-4 space-y-6">
      <h1 className="text-xl font-bold text-sky-400">Đề xuất kết bạn</h1>
      <FriendSuggestions />
    </div>
  );
}
