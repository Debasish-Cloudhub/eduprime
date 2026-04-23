'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      // Get role and route accordingly
      const me = await authApi.me();
      const role = me.data?.role;
      toast.success('Welcome back!');
      if (role === 'STUDENT') router.push('/student');
      else if (role === 'SALES_AGENT') router.push('/sales');
      else if (role === 'FINANCE') router.push('/finance');
      else router.push('/admin');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      admin:   { email: 'admin@eduprime.in',   password: 'EduPrime@2025' },
      sales:   { email: 'sales@eduprime.in',   password: 'EduPrime@2025' },
      finance: { email: 'finance@eduprime.in', password: 'EduPrime@2025' },
      student: { email: 'student@eduprime.in', password: 'EduPrime@2025' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-700 rounded-2xl shadow-lg mb-4">
              <span className="text-2xl font-black text-white">EP</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Sign In</h1>
            <p className="text-gray-500 text-sm mt-1">EduPrime Education Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" type="email"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Enter your password" type={showPass ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 text-sm mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-xs text-gray-400 mb-3">QUICK DEMO ACCESS</p>
            <div className="grid grid-cols-2 gap-2">
              {['admin', 'sales', 'finance', 'student'].map(role => (
                <button key={role} onClick={() => fillDemo(role)}
                  className="py-2 px-3 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 capitalize">
                  {role === 'sales' ? 'Sales Agent' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              New student?{' '}
              <Link href="/auth/register" className="text-blue-700 font-semibold hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
