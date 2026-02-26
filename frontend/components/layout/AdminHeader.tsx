'use client';

import { useState, useRef, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { IMAGES } from '@/lib/constants';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'order' | 'review' | 'stock' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications — replace with API call when backend supports it
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order #1042',
    message: 'Jordan D. placed an order for $299.00',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'review',
    title: 'New Review',
    message: 'Maria S. left a 5-star review on Acoustic Pro-X',
    time: '15m ago',
    read: false,
  },
  {
    id: '3',
    type: 'stock',
    title: 'Low Stock Alert',
    message: 'Acoustic Pro-X Wireless has only 3 units left',
    time: '1h ago',
    read: false,
  },
  {
    id: '4',
    type: 'order',
    title: 'Order #1041 Shipped',
    message: 'Order for Carlos M. has been dispatched',
    time: '3h ago',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'System Update',
    message: 'FlexiCommerce platform updated to v2.4.1',
    time: '1d ago',
    read: true,
  },
];

const NOTIFICATION_ICONS: Record<string, string> = {
  order: 'shopping_cart',
  review: 'star',
  stock: 'inventory',
  system: 'info',
};

const NOTIFICATION_COLORS: Record<string, string> = {
  order: 'bg-blue-50 text-blue-600',
  review: 'bg-yellow-50 text-yellow-600',
  stock: 'bg-orange-50 text-orange-600',
  system: 'bg-primary/10 text-primary',
};

export function AdminHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={onMenuToggle}
        >
          <MaterialIcon name="menu" />
        </button>

        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
          <MaterialIcon name="store" className="text-slate-500 text-[18px]" />
          <span className="text-sm font-semibold hidden sm:inline">Main Boutique Store</span>
          <span className="text-sm font-semibold sm:hidden">Store</span>
          <MaterialIcon name="expand_more" className="text-slate-400 text-[18px]" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
          >
            <MaterialIcon name="notifications" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 size-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-primary/10 z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-primary text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-bold text-primary/50 hover:text-primary transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-primary/5">
                {notifications.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <MaterialIcon name="notifications_none" className="text-4xl text-primary/20 mb-2" />
                    <p className="text-sm text-primary/40">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`w-full flex items-start gap-3 px-5 py-4 hover:bg-primary/2 transition-colors text-left ${
                        !notif.read ? 'bg-primary/3' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${NOTIFICATION_COLORS[notif.type]}`}>
                        <MaterialIcon name={NOTIFICATION_ICONS[notif.type]} className="text-base" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-bold leading-tight ${!notif.read ? 'text-primary' : 'text-primary/70'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-primary/30 shrink-0 mt-0.5">{notif.time}</span>
                        </div>
                        <p className="text-xs text-primary/50 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>

                      {/* Unread dot */}
                      {!notif.read && (
                        <div className="size-2 bg-primary rounded-full shrink-0 mt-2" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-primary/10 text-center">
                <Link href="/admin/orders" className="text-xs font-bold text-primary hover:text-primary/70 transition-colors">
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1" />
        <div className="flex items-center gap-3 pl-2">
          <div className="size-8 rounded-full overflow-hidden">
            <img src={IMAGES.userAvatar} alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">Admin User</p>
            <p className="text-xs text-slate-400">Store Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
