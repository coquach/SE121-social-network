import type { Metadata } from 'next';
import { Conversations } from './conversations';

export const metadata: Metadata = {
  title: 'Tin nhắn',
  description: 'Danh sách cuộc trò chuyện của bạn.',
};

export default function ConversationPage() {
  return (
    <>
      <Conversations />
    </>
  );
}
