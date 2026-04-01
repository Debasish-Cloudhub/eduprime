'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '../lib/api';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    authApi.me().then(r => {
      const role = r.data?.role;
      if (role === 'STUDENT') router.push('/student');
      else if (role === 'SALES_AGENT') router.push('/sales');
      else router.push('/admin');
    }).catch(() => router.push('/auth/login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full"/>
    </div>
  );
}
