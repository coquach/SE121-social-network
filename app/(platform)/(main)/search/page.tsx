import type { Metadata } from 'next';
import SearchPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Tìm kiếm',
  description: 'Tìm kiếm bài viết, nhóm và bạn bè.',
};

export default function SearchPage() {
  return <SearchPageClient />;
}
