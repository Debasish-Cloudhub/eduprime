'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { Bell, CheckCheck, X, Info, AlertTriangle, CheckCircle, Award } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_ICON: Record<string, any> = {
  LEAD_ASSIGNED:   Info,
  SLA_BREACH:      AlertTriangle,
  EXPENSE_APPROVED: CheckCircle,
  EXPENSE_REJECTED: X,
  INCENTIVE_LOCKED: Award,
  INCENTIVE_PAID:   Award,
  DEFAULT:          Info,
};
const TYPE_COLOR: Record<string, string> = {
  LEAD_ASSIGNED:    'text-blue-600 bg-blue-50',
  SLA_BREACH:       'text-red-600 bg-red-50',
  EXPENSE_APPROVED: 'text-green-600 bg-green-50',
  EXPENSE_REJECTED: 'text-red-600 bg-red-50',
  INCENTIVE_LOCKED: 'text-purple-600 bg-purple-50',
  INCENTIVE_PAID:   'text-green-600 bg-green-50',
  DEFAULT:          'text-gray-600 bg-gray-50',
};

export default function NotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useQuery({
    queryKey: ['notif-unread'],
    queryFn: () => notificationsApi.getUnreadCount().then(r => r.data),
    refetchInterval: 30000, // poll every 30s
  });

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll({ limit: 20 }).then(r => r.data),
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notif-unread'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notif-unread'] });
    },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = unreadData?.count ?? 0;
  const list: any[] = notifs?.data || notifs || [];

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={() => markAll.mutate()}
                  className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1">
                  <CheckCheck size={12}/> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14}/>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {list.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              list.map((n: any) => {
                const Icon = TYPE_ICON[n.type] || TYPE_ICON.DEFAULT;
                const color = TYPE_COLOR[n.type] || TYPE_COLOR.DEFAULT;
                return (
                  <div key={n.id}
                    onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {n.title || n.message}
                      </p>
                      {n.title && n.message && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(n.createdAt), 'dd MMM · HH:mm')}
                      </p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
