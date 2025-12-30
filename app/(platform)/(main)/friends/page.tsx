import type { Metadata } from 'next';
import { FriendList } from './friend-list';

export const metadata: Metadata = {
  title: 'Bạn bè',
  description: 'Danh sách bạn bè trên Sentimeta.',
};

export default function FriendsPage() {
  return <FriendList />;
}
