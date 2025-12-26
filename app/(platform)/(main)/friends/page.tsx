import { FriendList } from "./friend-list";

export default function FriendsPage() {
  return (
    <div className="h-full w-full p-4 space-y-6">
      <h1 className="text-xl font-bold text-sky-400">Tất cả bạn bè</h1>
      <FriendList />
    </div>
  );
}
