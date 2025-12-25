'use client';
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NotificationDTO } from '@/models/notification/notificationDTO';

interface NotificationCardProps {
  notif: NotificationDTO;
  onClick?: (id: string) => void;
}

export const NotificationCard = ({ notif, onClick }: NotificationCardProps) => {
  const { payload, message, status, createdAt } = notif;
  const safePayload =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : null;
  const actorAvatar =
    typeof safePayload?.actorAvatar === 'string'
      ? safePayload.actorAvatar
      : '/images/placeholder.png';
  const content =
    typeof safePayload?.message === 'string' ? safePayload.message : message;

  return (
    <div
      onClick={() => onClick?.(notif._id)}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl cursor-pointer  border-b border-gray-100',
        status !== 'read' ? 'bg-sky-50 hover:bg-sky-100' : 'hover:bg-gray-100 bg-white'
      )}
    >
      {/* Avatar */}
      <Image
        src={actorAvatar}
        alt="avatar"
        width={40}
        height={40}
        className="rounded-full border border-gray-200 object-cover shrink-0"
      />

      {/* Nội dung */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm text-gray-800 whitespace-normal break-normal max-w-full">
          {content}
        </span>
        <span className="text-xs text-gray-400 text-right mt-1">
          {new Date(createdAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

NotificationCard.Skeleton = function NotificationCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border-b border-gray-100 animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />

      {/* Content skeleton */}
      <div className="flex flex-col flex-1 gap-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded mt-1" />
      </div>
    </div>
  );
};
