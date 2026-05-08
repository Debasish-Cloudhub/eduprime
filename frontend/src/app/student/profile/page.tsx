'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import { User, Phone, MapPin, GraduationCap, Mail, Save, Key, Eye, EyeOff } from 'lucide-react';

export default function StudentProfilePage() {
  const qc = useQueryClient();
  const { data: me, isLoading } = useQuery({ queryKey: ['me'], queryFn: () => authApi.me().then(r => r.data) });

  const [form, setForm]       = useState({ name:'', phone:'' });
  const [pwForm, setPwForm]   = useState({ oldPassword:'', newPassword:'', confirm:'' });
  const [showPw, setShowPw]   = useState(false);
  const [tab, setTab]         = useState<'profile'|'password'>('profile');

  useEffect(() => {
    if (me) setForm({ name: me.name||'', phone: me.phone||'' });
  }, [me]);

  const updateMutation = useMutation({
    mutationFn: () => authApi.updateMe(form),
    onSuccess: (r) => {
      toast.success('Profile updated successfully!');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Update failed'),
  });

  const pwMutation = useMutation({
    mutationFn: () => authApi.changePassword(pwForm.oldPassword, pwForm.newPassword),
    onSuccess: () => { toast.success('Password changed!'); setPwForm({ oldPassword:'', newPassword:'', confirm:'' }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Password change failed'),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (isLoading) return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Profile" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Profile" />
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">

        {/* Avatar + info */}
        <div className="card mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-black text-brand-700 flex-shrink-0">
            {form.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{form.name || 'Student'}</h2>
            <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5"><Mail size={13}/>{me?.email}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium mt-1 inline-block">{me?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {(['profile', 'password'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab===t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1"><User size={13}/> Full Name</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <label className="label flex items-center gap-1"><Phone size={13}/> Phone Number</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>

            </div>
            <div className="pt-2">
              <label className="label flex items-center gap-1"><Mail size={13}/> Email (cannot be changed)</label>
              <input className="input bg-gray-50 text-gray-400 cursor-not-allowed" value={me?.email || ''} readOnly />
            </div>
            <button
              onClick={() => { if (!form.name.trim()) { toast.error('Name is required'); return; } updateMutation.mutate(); }}
              disabled={updateMutation.isPending}
              className="btn-primary flex items-center gap-2 mt-2">
              <Save size={15}/> {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {tab === 'password' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-800 mb-2">Change Password</h3>
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'} value={pwForm.oldPassword}
                  onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))} placeholder="Current password" />
                <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input className="input" type="password" value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" />
            </div>
            <button
              onClick={() => {
                if (!pwForm.oldPassword || !pwForm.newPassword) { toast.error('All fields required'); return; }
                if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
                if (pwForm.newPassword.length < 8) { toast.error('Minimum 8 characters'); return; }
                pwMutation.mutate();
              }}
              disabled={pwMutation.isPending}
              className="btn-primary flex items-center gap-2">
              <Key size={15}/> {pwMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
