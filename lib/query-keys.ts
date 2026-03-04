/**
 * Centralized React Query Keys
 * 
 * This file contains all query keys used across the application.
 * Centralizing query keys ensures:
 * - Consistent cache invalidation
 * - Easier refactoring
 * - Type-safe query key access
 * - Better organization
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */

import { TargetType, ReactionType } from '@/models/social/enums/social.enum';
import { CursorPagination } from './cursor-pagination.dto';

export const queryKeys = {
  // ==================== User ====================
  user: {
    all: ['user'] as const,
    detail: (userId: string) => [...queryKeys.user.all, userId] as const,
  },

  // ==================== Posts ====================
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.posts.lists(), userId] as const,
    myPosts: () => [...queryKeys.posts.lists(), 'me'] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (postId: string) => [...queryKeys.posts.details(), postId] as const,
    editHistories: (postId: string) => 
      [...queryKeys.posts.detail(postId), 'edit-histories'] as const,
    byGroup: (groupId: string) => 
      [...queryKeys.posts.all, 'group', groupId] as const,
    groupPending: (groupId: string) => 
      [...queryKeys.posts.byGroup(groupId), 'pending'] as const,
  },

  // ==================== Reactions ====================
  reactions: {
    all: ['reactions'] as const,
    list: (targetId: string, targetType?: TargetType, reactionType?: ReactionType) => 
      [...queryKeys.reactions.all, targetId, targetType, reactionType].filter(Boolean) as const,
  },

  // ==================== Comments ====================
  comments: {
    all: ['comments'] as const,
    list: (rootId: string, rootType?: string, parentId?: string) => 
      [...queryKeys.comments.all, rootId, rootType, parentId].filter(Boolean) as const,
  },

  // ==================== Shares ====================
  shares: {
    all: ['shares'] as const,
    detail: (shareId: string) => ['share', shareId] as const,
    byPost: (postId: string) => [...queryKeys.shares.all, postId] as const,
    byUser: (userId: string) => [...queryKeys.shares.all, userId] as const,
  },

  // ==================== Notifications ====================
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => [...queryKeys.notifications.all, userId] as const,
  },

  // ==================== Feed ====================
  feed: {
    all: ['feed'] as const,
    personal: (emotion?: string) => 
      ['my-feed', emotion ?? 'ALL'] as const,
    trending: (emotion?: string) => 
      ['trending-feed', emotion ?? 'ALL'] as const,
  },

  // ==================== Friends ====================
  friends: {
    all: ['friends'] as const,
    list: (userId?: string) => 
      ['get-friends', userId].filter(Boolean) as const,
    userFriends: (userId: string) => 
      ['get-user-friends', userId] as const,
    requests: () => ['friend-requests'] as const,
    suggestions: (query?: CursorPagination) => 
      ['friend-suggestions', query].filter(Boolean) as const,
    blocked: () => ['blocked-users'] as const,
  },

  // ==================== Groups ====================
  groups: {
    all: ['groups'] as const,
    myGroups: () => ['get-my-groups'] as const,
    invited: (query?: CursorPagination) => 
      ['get-invited-groups', query].filter(Boolean) as const,
    detail: (groupId: string) => ['group', groupId] as const,
    members: (groupId: string, filter?: string) => 
      ['group-members', groupId, filter].filter(Boolean) as const,
    joinRequests: (groupId: string, filter?: string) => 
      ['group-join-requests', groupId, filter].filter(Boolean) as const,
    logs: (groupId: string, filter?: string) => 
      ['group-logs', groupId, filter].filter(Boolean) as const,
    settings: (groupId: string) => 
      ['group-settings', groupId] as const,
    recommended: (query?: CursorPagination) => 
      ['recommended-groups', query].filter(Boolean) as const,
  },

  // ==================== Conversations ====================
  conversations: {
    all: ['conversations'] as const,
    list: () => [...queryKeys.conversations.all] as const,
    detail: (conversationId: string) => 
      ['conversation', conversationId] as const,
  },

  // ==================== Messages ====================
  messages: {
    all: ['messages'] as const,
    list: (conversationId: string) => 
      [...queryKeys.messages.all, { conversationId }] as const,
  },

  // ==================== Search ====================
  search: {
    all: ['search'] as const,
    posts: (filter: string) => 
      [...queryKeys.search.all, 'posts', filter] as const,
    groups: (filter: string) => 
      [...queryKeys.search.all, 'groups', filter] as const,
    users: (filter: string) => 
      [...queryKeys.search.all, 'users', filter] as const,
  },

  // ==================== Reports ====================
  reports: {
    all: ['reports'] as const,
    list: () => [...queryKeys.reports.all, 'list'] as const,
    detail: (reportId: string) => [...queryKeys.reports.all, reportId] as const,
  },

  // ==================== Admin ====================
  admin: {
    all: ['admin'] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
    users: (query?: unknown) => 
      [...queryKeys.admin.all, 'users', query].filter(Boolean) as const,
    groups: (query?: unknown) => 
      [...queryKeys.admin.all, 'groups', query].filter(Boolean) as const,
    logs: (query?: unknown) => 
      [...queryKeys.admin.all, 'logs', query].filter(Boolean) as const,
  },

  // ==================== Emotion Journal ====================
  emotionJournal: {
    all: ['emotion-journal'] as const,
    entries: (query?: unknown) => 
      [...queryKeys.emotionJournal.all, 'entries', query].filter(Boolean) as const,
    analytics: () => 
      [...queryKeys.emotionJournal.all, 'analytics'] as const,
  },
} as const;

/**
 * Type-safe query key factory
 * Usage example:
 * 
 * ```ts
 * const postKey = queryKeys.posts.detail('post-123')
 * const reactionsKey = queryKeys.reactions.list('target-id', TargetType.POST)
 * ```
 */
export type QueryKeys = typeof queryKeys;
