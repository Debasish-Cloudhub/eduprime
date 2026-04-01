'use client';
import { useAuth } from '@/hooks/useAuth';

import Sidebar from '@/components/ui/Sidebar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && !['ADMIN', 'FINANCE'].includes(user.role)) {
      router.push('/auth/login');
    }
  }, [user, loading]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user?.role || 'ADMIN'} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
