'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import { Plus, Search, Users, UserCheck, UserX, Key, GraduationCap, Shield } from 'lucide-react';

const ROLES = ['ADMIN', 'SALES_AGENT', 'FINANCE', 'STUDENT'];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SALES_AGENT: 'bg-blue-100 text-blue-700',
  FINANCE: 'bg-green-100 text-green-700',
  STUDENT: 'bg-yellow-100 text-yellow-700',
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES_AGENT', phone: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: () => usersApi.getAll({ search, role: roleFilter || undefined }),
  });

  const create = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowAdd(false); setForm({ name: '', email: '', password: '', role: 'SALES_AGENT', phone: '' }); toast.success('User created successfully'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create user'),
  });

  const toggle = useMutation({
    mutationFn: usersApi.toggleActive,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User status updated'); },
  });

  const resetPwd = useMutation({
    mutationFn: ({ id, password }: any) => usersApi.update(id, { password }),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: () => toast.error('Failed to reset password'),
  });

  const users = data?.data?.users || [];
  const total = data?.data?.total || 0;
  const students = users.filter((u: any) => u.role === 'STUDENT');
  const active = users.filter((u: any) => u.isActive);

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="User Management" subtitle="Manage all users and portal access" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: total, icon: Users, color: 'blue' },
            { label: 'Active Users', value: active.length, icon: UserCheck, color: 'green' },
            { label: 'Students', value: students.length, icon: GraduationCap, color: 'yellow' },
            { label: 'Admins', value: users.filter((u: any) => u.role === 'ADMIN').length, icon: Shield, color: 'purple' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-${color}-50 rounded-2xl p-4 border border-${color}-100`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div><div className="text-2xl font-black text-gray-900">{value}</div><div className="text-xs text-gray-500">{label}</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Add */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          {/* Student Access Notice */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800 text-xs font-medium">
              <GraduationCap className="w-4 h-4 inline mr-1" />
              <strong>Student Portal Access:</strong> Toggle the Active/Inactive status to grant or revoke a student's ability to login. Inactive students cannot access the portal.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  {['Name', 'Email', 'Role', 'Phone', 'Status', 'Portal Access', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium text-xs">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 font-semibold text-gray-900">{user.name}</td>
                      <td className="py-3 px-3 text-gray-500">{user.email}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{user.phone || '—'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {user.role === 'STUDENT' ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-red-500'}`}>
                              {user.isActive ? '✓ Granted' : '✗ Revoked'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => toggle.mutate(user.id)}
                            className={`px-2.5 py-1.5 text-xs rounded-lg font-medium ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {user.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          </button>
                          <button onClick={() => {
                            const pwd = prompt(`Reset password for ${user.name}:`);
                            if (pwd && pwd.length >= 8) resetPwd.mutate({ id: user.id, password: pwd });
                            else if (pwd) toast.error('Password must be at least 8 characters');
                          }} className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                            <Key className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Create New User</h3>
              <div className="space-y-4">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email *" type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password * (min 8 chars)" type="password" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
                {form.role === 'STUDENT' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">Student will receive login credentials via email. You can activate/deactivate their access from the users list.</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={() => create.mutate(form)} disabled={create.isPending || !form.name || !form.email || !form.password}
                  className="flex-1 py-3 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50">
                  {create.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
