'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import ISCCLogo from '@/components/ui/ISCCLogo';
import { GraduationCap, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', course: '', qualification: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      setDone(true);
      toast.success('Registration successful!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Registration Successful!</h2>
        <p className="text-gray-500 mb-2">Your account has been created.</p>
        <p className="text-gray-500 text-sm mb-8">Please wait for admin approval, or log in directly if access has been granted.</p>
        <Link href="/auth/login" className="block w-full py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 text-center">
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back */}
        <Link href="/" className="flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-700 rounded-2xl mb-4">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Student Registration</h1>
            <p className="text-gray-500 text-sm mt-1">Create your ISCC account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Priya Sharma" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
                <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210" type="tel" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
              <input required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Interested Course</label>
                <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-500">
                  <option value="">Select Course</option>
                  {['MBA', 'B.Tech', 'BBA', 'MCA', 'B.Sc Nursing', 'Study Abroad', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Qualification</label>
                <select value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-500">
                  <option value="">Select Qualification</option>
                  {['10th Pass', '12th Pass', 'Diploma', "Bachelor's Degree", "Master's Degree", 'Other'].map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Create Password *</label>
              <div className="relative">
                <input required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters" type={showPass ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2">
              {loading ? 'Creating Account...' : 'Create My Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-700 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              After registration, an ISCC counselor will contact you within 24 hours to activate your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
