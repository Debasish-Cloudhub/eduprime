'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { Plus, Trash2, FileSpreadsheet, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import { exportToExcel, exportToPDF } from '@/lib/export';

const CATEGORIES = ['TRAVEL','MARKETING','OFFICE','MEALS','COMMUNICATION','OTHER'];

export default function SalesExpensesPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState({
    category: 'TRAVEL', amount: '', description: '',
    month: String(now.getMonth() + 1), year: String(now.getFullYear()),
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data, isLoading } = useQuery({
    queryKey: ['my-expenses'],
    queryFn: () => expensesApi.getAll({ limit: 200 }).then(r => r.data),
  });

  const { data: summary } = useQuery({
    queryKey: ['my-expense-summary', now.getMonth() + 1, now.getFullYear()],
    queryFn: () => expensesApi.getMySummary(now.getMonth() + 1, now.getFullYear()).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['my-expenses'] }); toast.success('Expense deleted'); setDeleteId(null); },
    onError: () => toast.error('Delete failed — only PENDING expenses can be deleted'),
  });

  const createMutation = useMutation({
    mutationFn: () => expensesApi.create({
      category:    form.category,
      amount:      parseFloat(form.amount),
      description: form.description,
      month:       parseInt(form.month),
      year:        parseInt(form.year),
    }),
    onSuccess: () => {
      toast.success('Expense submitted successfully!');
      qc.invalidateQueries({ queryKey: ['my-expenses'] });
      qc.invalidateQueries({ queryKey: ['my-expense-summary'] });
      setShowForm(false);
      setForm({ category:'TRAVEL', amount:'', description:'', month:String(now.getMonth()+1), year:String(now.getFullYear()) });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to submit expense'),
  });

  const expenses: any[] = data?.expenses || data?.data || [];
  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const doExcel = () => {
    const rows = expenses.map(e => ({
      Category:    e.category,
      Amount:      `₹${Number(e.amount).toLocaleString('en-IN')}`,
      Description: e.description || '',
      Month:       `${e.month}/${e.year}`,
      Status:      e.status,
      'Rejection Reason': e.rejectionReason || '',
      Date:        e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : '',
    }));
    exportToExcel(rows, `My_Expenses_${new Date().toISOString().slice(0,10)}`, 'Expenses');
    toast.success('Excel downloaded!');
  };

  const doPDF = async () => {
    const cols = ['Category','Amount','Description','Month/Year','Status','Date'];
    const rows = expenses.map(e => [
      e.category, `₹${Number(e.amount).toLocaleString()}`,
      e.description||'', `${e.month}/${e.year}`, e.status,
      e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : '',
    ]);
    await exportToPDF(cols, rows, 'My Expenses Report — ISCC Digital', `My_Expenses_${new Date().toISOString().slice(0,10)}`);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Expenses" subtitle="Log and track your business expenses" />
      <div className="flex-1 p-6">

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-gray-400 text-xs mb-1">This Month</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(summary?.total || 0)}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-xs mb-1">Total Submitted</p>
            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-xs mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{expenses.filter((e:any) => e.status === 'APPROVED').length}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-xs mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-500">{expenses.filter((e:any) => e.status === 'PENDING').length}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800">
            <Plus className="w-4 h-4" /> Log Expense
          </button>
          <div className="flex gap-2 ml-auto">
            <button onClick={doExcel}
              className="flex items-center gap-2 px-3 py-2 border border-green-200 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button onClick={doPDF}
              className="flex items-center gap-2 px-3 py-2 border border-red-200 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100">
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Category','Amount','Description','Month/Year','Status','Reason','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No expenses yet. Click "Log Expense" to add one.</td></tr>
              ) : expenses.map((exp: any) => (
                <tr key={exp.id} className="table-row">
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{exp.category}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{fmt(exp.amount)}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{exp.description || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{exp.month}/{exp.year}</td>
                  <td className="px-4 py-3"><StatusBadge status={exp.status} /></td>
                  <td className="px-4 py-3 text-red-500 text-xs max-w-[150px] truncate">{exp.rejectionReason || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {exp.createdAt ? format(new Date(exp.createdAt), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {exp.status === 'PENDING' && (
                      <button onClick={() => setDeleteId(exp.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600" title="Delete">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Log New Expense</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Category *</label>
                <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (₹) *</label>
                <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} placeholder="Brief description of expense..." value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Month *</label>
                  <select className="input" value={form.month} onChange={e => set('month', e.target.value)}>
                    {['1','2','3','4','5','6','7','8','9','10','11','12'].map((m,i) =>
                      <option key={m} value={m}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year *</label>
                  <select className="input" value={form.year} onChange={e => set('year', e.target.value)}>
                    {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => { if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount'); return; } createMutation.mutate(); }}
                disabled={createMutation.isPending}
                className="flex-1 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50">
                {createMutation.isPending ? 'Submitting...' : 'Submit Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">Delete Expense?</h3>
            <p className="text-gray-500 text-sm mb-5">This will permanently remove the expense record. Only pending expenses can be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}