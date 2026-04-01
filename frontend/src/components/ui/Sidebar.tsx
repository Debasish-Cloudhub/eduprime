'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Users, BookOpen, TrendingUp, DollarSign,
  Bell, Settings, LogOut, FileSpreadsheet, Zap, BarChart2,
  ClipboardList, GraduationCap, RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';

const navByRole: Record<string, { label: string; href: string; icon: any }[]> = {
  ADMIN: [
    { label: 'Dashboard',   href: '/admin',            icon: LayoutDashboard },
    { label: 'Leads',       href: '/admin/leads',      icon: ClipboardList },
    { label: 'Courses',     href: '/admin/courses',    icon: BookOpen },
    { label: 'Users',       href: '/admin/users',      icon: Users },
    { label: 'Incentives',  href: '/admin/incentives', icon: DollarSign },
    { label: 'Expenses',    href: '/admin/expenses',   icon: TrendingUp },
    { label: 'Analytics',   href: '/admin/analytics',  icon: BarChart2 },
    { label: 'Excel Upload',href: '/admin/excel',      icon: FileSpreadsheet },
    { label: 'Sulekha',     href: '/admin/sulekha',    icon: RefreshCw },
    { label: 'SLA',         href: '/admin/sla',        icon: Zap },
  ],
  SALES_AGENT: [
    { label: 'Dashboard',   href: '/sales',            icon: LayoutDashboard },
    { label: 'My Leads',    href: '/sales/leads',      icon: ClipboardList },
    { label: 'Board View',  href: '/sales/board',      icon: BarChart2 },
    { label: 'Courses',     href: '/sales/courses',    icon: BookOpen },
    { label: 'Incentives',  href: '/sales/incentives', icon: DollarSign },
    { label: 'Expenses',    href: '/sales/expenses',   icon: TrendingUp },
  ],
  FINANCE: [
    { label: 'Dashboard',   href: '/admin',            icon: LayoutDashboard },
    { label: 'Incentives',  href: '/admin/incentives', icon: DollarSign },
    { label: 'Expenses',    href: '/admin/expenses',   icon: TrendingUp },
    { label: 'Analytics',   href: '/admin/analytics',  icon: BarChart2 },
  ],
  STUDENT: [
    { label: 'Home',        href: '/student',          icon: LayoutDashboard },
    { label: 'Courses',     href: '/student/courses',  icon: GraduationCap },
    { label: 'My Applications', href: '/student/applications', icon: ClipboardList },
    { label: 'Profile',     href: '/student/profile',  icon: Users },
  ],
};

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const nav = navByRole[role] || [];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EP</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">EduPrime</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx('sidebar-link', pathname === href && 'active')}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-brand-700 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-gray-600" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
