'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import { Plus, Search, UserCheck, UserX, Key, GraduationCap, Shield, Pencil, Trash2 } from 'lucide-react';

const ROLES = ['ADMIN', 'SALES_AGENT', 'FINANCE', 'STUDENT'];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SALES_AGENT: 'bg-blue-100 text-blue-700',
  FINANCE: 'bg-green-100 text-green-700',
  STUDENT: 'bg-yellow-100 text-yellow-700',
};

const emptyForm = { name: '', email: '', password: '', role: 'SALES_AGENT', phone: '' };

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: () => usersApi.getAll({ search: search || undefined, role: roleFilter || undefined }),
  });

  const create = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false); setForm(emptyForm);
      toast.success('User created successfully');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create user'),
  });

  const update = useMutation({
    mutationFn: ({ id, dto }: any) => usersApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false); setEditUser(null); setForm(emptyForm);
      toast.success('User updated successfully');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update user'),
  });

  const toggle = useMutation({
    mutationFn: usersApi.toggleActive,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User status updated'); },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteUser = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
      toast.success('User deleted successfully');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete user'),
  });

  const resetPwd = useMutation({
    mutationFn: ({ id, password }: any) => usersApi.update(id, { password }),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: () => toast.error('Failed to reset password'),
  });

  const users = data?.data?.data || data?.data?.users || [];
  const total = data?.data?.meta?.total || data?.data?.total || users.length;

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (u: any) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' }); setShowModal(true); };

  const handleSubmit = () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (!editUser && !form.password) { toast.error('Password is required for new users'); return; }
    if (editUser) {
      const dto: any = { name: form.name, phone: form.phone };
      if (form.password) dto.password = form.password;
      update.mutate({ id: editUser.id, dto });
    } else {
      create.mutate(form);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="User Management" subtitle="Add, edit, delete and manage all portal users" />
      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: total, color: 'blue' },
            { label: 'Active', value: users.filter((u: any) => u.isActive).length, color: 'green' },
            { label: 'Students', value: users.filter((u: any) => u.role === 'STUDENT').length, color: 'yellow' },
            { label: 'Staff', value: users.filter((u: any) => u.role !== 'STUDENT').length, color: 'purple' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4`}>
              <div className="text-2xl font-black text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none">
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          {/* Student access notice */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
            <GraduationCap className="w-4 h-4 inline mr-1" />
            <strong>Student Portal Access:</strong> Toggle Active/Inactive to grant or revoke student login access.
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    {['Name', 'Email', 'Role', 'Phone', 'Status', 'Actions'].map(h => (
                      <th key={h} className="py-3 px-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                        <div className="flex items-center gap-1.5">
                          {/* Edit */}
                          <button onClick={() => openEdit(user)} title="Edit user"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {/* Toggle Active */}
                          <button onClick={() => toggle.mutate(user.id)} title={user.isActive ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          {/* Reset Password */}
                          <button onClick={() => {
                            const pwd = prompt(`New password for ${user.name} (min 8 chars):`);
                            if (pwd && pwd.length >= 8) resetPwd.mutate({ id: user.id, password: pwd });
                            else if (pwd) toast.error('Password must be at least 8 characters');
                          }} title="Reset password"
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button onClick={() => setDeleteTarget(user)} title="Delete user"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{editUser ? 'Edit User' : 'Create New User'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email"
                  disabled={!!editUser}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              {!editUser && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role *</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                    {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {editUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editUser ? 'Leave blank to keep current' : 'Min 8 characters'} type="password"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditUser(null); setForm(emptyForm); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={create.isPending || update.isPending}
                className="flex-1 py-3 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50">
                {create.isPending || update.isPending ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User</h3>
            <p className="text-gray-500 text-sm mb-1">Are you sure you want to delete</p>
            <p className="font-semibold text-gray-900 mb-6">"{deleteTarget.name}"?</p>
            <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => deleteUser.mutate(deleteTarget.id)} disabled={deleteUser.isPending}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50">
                {deleteUser.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
