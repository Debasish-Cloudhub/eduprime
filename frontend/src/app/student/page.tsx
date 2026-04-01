'use client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { GraduationCap, Search, BookOpen, ArrowRight } from 'lucide-react';

export default function StudentHome() {
  const { user } = useAuth();
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-200 font-medium mb-3">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect College & Course</h1>
          <p className="text-blue-100 text-lg mb-10">India & Abroad Admissions Consulting</p>
          <Link href="/student/courses" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg">
            <Search size={20}/> Explore Courses <ArrowRight size={18}/>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <Search size={28}/>, title: 'Browse Courses', desc: 'Search from 500+ courses across top colleges', href: '/student/courses', color: 'bg-blue-50 text-blue-700' },
            { icon: <BookOpen size={28}/>, title: 'My Applications', desc: 'Track your application status', href: '/student/applications', color: 'bg-green-50 text-green-700' },
            { icon: <GraduationCap size={28}/>, title: 'My Profile', desc: 'Update your academic profile', href: '/student/profile', color: 'bg-purple-50 text-purple-700' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="card hover:shadow-md transition-shadow group">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${a.color}`}>{a.icon}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-700">{a.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
              <div className="flex items-center gap-1 text-brand-600 text-sm font-medium mt-4 group-hover:gap-2 transition-all">Get started <ArrowRight size={14}/></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
