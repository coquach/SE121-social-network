'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GroupAdminMembersSection } from './_components/members/admin-members-section';
import { GroupAdminJoinRequestsSection } from './_components/join-request/admin-join-request-section';
import { GroupAdminReportsSection } from './_components/report/admin-report-section';
import { GroupAdminLogsSection } from './_components/logs/admin-logs-section';
import { GroupAdminPostsSection } from './_components/posts/admin-posts-section';

type GroupAdminPanelProps = {
  groupId: string;
};

type AdminTabKey = 'members' | 'posts' | 'joinRequests' | 'reports' | 'logs';

const TABS: { key: AdminTabKey; label: string; desc?: string }[] = [
  {
    key: 'members',
    label: 'Quản lý thành viên',
    desc: 'Vai trò, quyền, trạng thái',
  },
  { key: 'posts', label: 'Kiểm duyệt bài', desc: 'Duyệt / từ chối bài viết' },
  {
    key: 'joinRequests',
    label: 'Yêu cầu tham gia',
    desc: 'Xử lý yêu cầu vào nhóm',
  },
  { key: 'reports', label: 'Báo cáo', desc: 'Xem báo cáo vi phạm' },
  { key: 'logs', label: 'Nhật ký hoạt động', desc: 'Xem hoạt động quản trị' },
];

export const GroupAdminPanel = ({ groupId }: GroupAdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('members');

  return (
    <div className="flex gap-4 w-full overflow-auto">
      {/* Sidebar tabs */}
      <aside className="w-56 shrink-0 border rounded-xl bg-white p-2 shadow-md">
        <div className="px-2 py-3 mb-1 rounded-lg bg-sky-50 border border-sky-100">
          <h2 className="text-sm font-semibold text-sky-600">Quản lý nhóm</h2>
          <p className="text-[11px] text-sky-500/80">
            Chỉ hiển thị với quản trị viên / mod.
          </p>
        </div>
        <div className="space-y-1 mt-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors border cursor-pointer',
                activeTab === tab.key
                  ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                  : 'bg-white border-transparent text-slate-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600'
              )}
            >
              <div>{tab.label}</div>
              {tab.desc && (
                <div
                  className={cn(
                    'text-[11px]',
                    activeTab === tab.key ? 'text-sky-50/90' : 'text-slate-400'
                  )}
                >
                  {tab.desc}
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        {activeTab === 'members' && (
          <GroupAdminMembersSection groupId={groupId} />
        )}
        {activeTab === 'posts' && <GroupAdminPostsSection groupId={groupId} />}
        {activeTab === 'joinRequests' && (
          <GroupAdminJoinRequestsSection groupId={groupId} />
        )}
        {activeTab === 'reports' && (
          <GroupAdminReportsSection groupId={groupId} />
        )}
        {activeTab === 'logs' && <GroupAdminLogsSection groupId={groupId} />}
      </main>
    </div>
  );
};
