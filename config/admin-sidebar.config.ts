import { Role } from '@/lib/role';
import {
  LayoutDashboard,
  Users,
  FileText,
  UsersRound,
  BarChart3,
  Settings,
} from 'lucide-react';


export type SidebarItem = {
  title: string;
  url: string;
  icon: any;
  roles: Role[]; // 👈 role nào thấy item này
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'Tổng quan',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'moderator', 'staff'],
  },
  {
    title: 'Quản lý người dùng',
    url: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Quản lý nội dung',
    url: '/admin/posts',
    icon: FileText,
    roles: ['admin', 'moderator', 'staff'],
  },
  {
    title: 'Quản lý nhóm',
    url: '/admin/groups',
    icon: UsersRound,
    roles: ['admin', 'moderator'],
  },
  {
    title: 'Báo cáo & Phân tích',
    url: '/admin/analytics',
    icon: BarChart3,
    roles: ['admin', 'staff'],
  },
  {
    title: 'Cài đặt hệ thống',
    url: '/admin/settings',
    icon: Settings,
    roles: ['admin'],
  },
];
