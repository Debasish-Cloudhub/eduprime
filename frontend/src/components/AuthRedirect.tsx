'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

export default function AuthRedirect() {
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) return;
    authApi.me().then(r => {
      const role = r.data?.role;
      if (role === 'STUDENT') router.push('/student');
      else if (role === 'SALES_AGENT') router.push('/sales');
      else if (role === 'FINANCE') router.push('/finance');
      else router.push('/admin');
    }).catch(() => {});
  }, []);
  return null;
}
