'use client';
import ISCCLogo from '@/components/ui/ISCCLogo';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Search, User, LogOut } from 'lucide-react';

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full"/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/student" className="flex items-center gap-2">
            <ISCCLogo size="sm" showText={false} />
            <span className="font-bold text-gray-900">ISCC</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/student/courses" className="text-sm text-gray-600 hover:text-brand-600 font-medium flex items-center gap-1"><GraduationCap size={16}/> Courses</Link>
            <Link href="/student/applications" className="text-sm text-gray-600 hover:text-brand-600 font-medium">Applications</Link>
            <Link href="/student/profile" className="text-sm text-gray-600 hover:text-brand-600 font-medium flex items-center gap-1"><User size={16}/> Profile</Link>
            <button onClick={logout} className="text-gray-400 hover:text-gray-600"><LogOut size={18}/></button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayoutInner>{children}</StudentLayoutInner>;
}
