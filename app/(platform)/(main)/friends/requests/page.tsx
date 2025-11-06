import { FriendRequests } from './friend-requests';

export default function FriendsRequestPage() {
  return (
    <div className="h-full w-full p-4 space-y-6">
      <h1 className="text-xl font-bold text-sky-400">Tất cả lời mời</h1>
      <FriendRequests />
    </div>
  );
}
