'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import ISCCLogo from '@/components/ui/ISCCLogo';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      const res = await authApi.me();
      const role = res.data?.role;
      if (role === 'STUDENT') router.push('/student');
      else if (role === 'SALES_AGENT') router.push('/sales');
      else if (role === 'FINANCE') router.push('/finance');
      else router.push('/admin');
    } catch {
      toast.error('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021b79] via-[#022b6b] to-[#0575e6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-blue-200 hover:text-white mb-8 text-sm w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* ISCC Logo */}
          <div className="flex flex-col items-center mb-8">
            <ISCCLogo size="lg" showText={true} />
            <div className="mt-4 text-center">
              <h1 className="text-xl font-black text-gray-900">Sign In</h1>
              <p className="text-gray-400 text-sm mt-0.5">ISCC Digital Portal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email" autoComplete="email" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" autoComplete="current-password" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#021b79] to-[#0575e6] text-white font-bold rounded-xl hover:from-blue-800 hover:to-blue-600 disabled:opacity-50 transition-all text-sm shadow-lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              New student?{' '}
              <Link href="/auth/register" className="text-blue-700 font-semibold hover:underline">Register here</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-blue-300/50 text-xs mt-6">
          © 2025 ISCC Digital — International Study & Career Counselling
        </p>
      </div>
    </div>
  );
}
