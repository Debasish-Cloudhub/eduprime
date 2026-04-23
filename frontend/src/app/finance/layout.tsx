'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import Sidebar from '@/components/ui/Sidebar';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    authApi.me().then(r => {
      const role = r.data?.role;
      if (role !== 'FINANCE' && role !== 'ADMIN') router.push('/auth/login');
    }).catch(() => router.push('/auth/login'));
  }, []);
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="FINANCE" />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
