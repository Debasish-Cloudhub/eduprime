'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ISCCLogo from '@/components/ui/ISCCLogo';
import {
  LayoutDashboard, Users, BookOpen, TrendingUp,
  LogOut, FileSpreadsheet, Zap, BarChart2,
  ClipboardList, GraduationCap, RefreshCw, Shield, Award,
} from 'lucide-react';
import clsx from 'clsx';

const navByRole: Record<string, { label: string; href: string; icon: any }[]> = {
  ADMIN: [
    { label: 'Dashboard',     href: '/admin',             icon: LayoutDashboard },
    { label: 'Leads',         href: '/admin/leads',       icon: ClipboardList },
    { label: 'Courses',       href: '/admin/courses',     icon: BookOpen },
    { label: 'Users',         href: '/admin/users',       icon: Users },
    { label: 'Incentives',    href: '/admin/incentives',  icon: Award },
    { label: 'Expenses',      href: '/admin/expenses',    icon: TrendingUp },
    { label: 'Analytics',     href: '/admin/analytics',   icon: BarChart2 },
    { label: 'SLA',           href: '/admin/sla',         icon: Shield },
    { label: 'Excel',         href: '/admin/excel',       icon: FileSpreadsheet },
    { label: 'Sulekha',       href: '/admin/sulekha',     icon: RefreshCw },
  ],
  SALES_AGENT: [
    { label: 'Dashboard',     href: '/sales',             icon: LayoutDashboard },
    { label: 'My Leads',      href: '/sales/leads',       icon: ClipboardList },
    { label: 'Kanban Board',  href: '/sales/board',       icon: Zap },
    { label: 'Courses',       href: '/sales/courses',     icon: BookOpen },
    { label: 'My Incentives', href: '/sales/incentives',  icon: Award },
    { label: 'My Expenses',   href: '/sales/expenses',    icon: TrendingUp },
  ],
  FINANCE: [
    { label: 'Finance Home',  href: '/finance',           icon: LayoutDashboard },
  ],
  STUDENT: [
    { label: 'Dashboard',       href: '/student',              icon: LayoutDashboard },
    { label: 'Browse Courses',  href: '/student/courses',      icon: BookOpen },
    { label: 'My Applications', href: '/student/applications', icon: GraduationCap },
    { label: 'My Profile',      href: '/student/profile',      icon: Users },
  ],
};

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const effectiveRole = role || user?.role || 'STUDENT';
  const nav = navByRole[effectiveRole] || [];
  const roleLabel = effectiveRole.replace('_', ' ').toLowerCase();

  return (
    <aside className="w-60 bg-blue-950 text-white flex flex-col h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-blue-800/60">
        <Link href="/">
          <ISCCLogo size="sm" showText={true} textColor="light" />
        </Link>
        <div className="mt-2 px-0.5">
          <span className="text-xs text-blue-300 capitalize bg-blue-800/50 px-2 py-0.5 rounded-full">{roleLabel}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = (href === '/admin' || href === '/sales' || href === '/finance' || href === '/student')
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link key={label} href={href}
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-red-600 text-white shadow-lg' : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
              )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-blue-800/60 space-y-1">
        {user && (
          <div className="px-3 py-2 bg-blue-900/50 rounded-xl mb-2">
            <div className="text-white font-semibold text-sm truncate">{user.name}</div>
            <div className="text-blue-300 text-xs truncate">{user.email}</div>
          </div>
        )}
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-blue-300 hover:bg-red-600/20 hover:text-red-300 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
