'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';


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
            <div className="flex flex-col items-center gap-2">
            <svg width="56" height="56" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="80" height="80" rx="14" transform="rotate(45 50 50)" fill="#1E3A8A"/>
              <rect x="18" y="18" width="64" height="64" rx="10" transform="rotate(45 50 50)" fill="none" stroke="#E11D48" strokeWidth="2" opacity="0.9"/>
              <text x="50" y="58" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="26" fill="white">iscc</text>
            </svg>
            <div className="text-center">
              <div className="text-xl font-black leading-tight"><span style={{color:'#1E3A8A'}}>ISCC</span><span style={{color:'#E11D48'}}> Digital</span></div>
              <div style={{fontSize:'9px',color:'#9ca3af',letterSpacing:'0.1em',textTransform:'uppercase'}}>International Study &amp; Career Counselling</div>
            </div>
          </div>
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
