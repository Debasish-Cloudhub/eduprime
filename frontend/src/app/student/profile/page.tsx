'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { User, MapPin, GraduationCap, Globe } from 'lucide-react';

const COUNTRIES = ['India','USA','UK','Canada','Australia','Germany','New Zealand','Ireland','Singapore'];

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => authApi.me().then(r => r.data) });

  const [form, setForm] = useState({
    city: '', state: '', pincode: '', qualification: '',
    targetYear: '', preferredCountries: [] as string[],
  });

  useEffect(() => {
    if (me?.studentProfile) {
      const p = me.studentProfile;
      setForm({
        city: p.city || '', state: p.state || '', pincode: p.pincode || '',
        qualification: p.qualification || '', targetYear: p.targetYear?.toString() || '',
        preferredCountries: p.preferredCountries || [],
      });
    }
  }, [me]);

  const toggleCountry = (c: string) => {
    setForm(f => ({
      ...f,
      preferredCountries: f.preferredCountries.includes(c)
        ? f.preferredCountries.filter(x => x !== c)
        : [...f.preferredCountries, c],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h2>

      {/* Account Info */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-brand-700">{user?.name?.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
            <p className="text-gray-500">{user?.email}</p>
            <span className="badge badge-blue mt-1">Student</span>
          </div>
        </div>
      </div>

      {/* Academic Profile */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <GraduationCap size={18} /> Academic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Current Qualification</label>
            <select className="input" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}>
              <option value="">Select…</option>
              {['10th Grade','12th Grade','Diploma','B.Tech/B.E.','B.Sc','B.Com','B.A.','Graduate (Other)','Post Graduate'].map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Target Admission Year</label>
            <select className="input" value={form.targetYear} onChange={e => setForm(f => ({ ...f, targetYear: e.target.value }))}>
              <option value="">Select…</option>
              {[2025, 2026, 2027, 2028].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <MapPin size={18} /> Location
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="label">City</label><input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}/></div>
          <div><label className="label">State</label><input className="input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}/></div>
          <div><label className="label">Pincode</label><input className="input" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}/></div>
        </div>
      </div>

      {/* Preferred Countries */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Globe size={18} /> Preferred Study Destinations
        </h3>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map(c => (
            <button key={c} onClick={() => toggleCountry(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${form.preferredCountries.includes(c)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => toast.success('Profile saved! (Connect to profile update API)')}
        className="btn-primary w-full py-3 text-base"
      >
        Save Profile
      </button>
    </div>
  );
}
