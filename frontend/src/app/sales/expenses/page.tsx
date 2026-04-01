'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['TRAVEL','MARKETING','OFFICE','MEALS','COMMUNICATION','OTHER'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SalesExpensesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({ category: 'TRAVEL', amount: '', description: '', month: String(now.getMonth()+1), year: String(now.getFullYear()) });

  const { data } = useQuery({ queryKey: ['my-expenses'], queryFn: () => expensesApi.getAll().then(r => r.data) });
  const { data: summary } = useQuery({ queryKey: ['my-expense-summary'], queryFn: () => expensesApi.getMySummary(now.getMonth()+1, now.getFullYear()).then(r => r.data) });

  const createMutation = useMutation({
    mutationFn: () => expensesApi.create({ ...form, amount: parseFloat(form.amount) }),
    onSuccess: () => { toast.success('Expense submitted!'); qc.invalidateQueries({ queryKey: ['my-expenses'] }); setShowForm(false); setForm({ category:'TRAVEL', amount:'', description:'', month:String(now.getMonth()+1), year:String(now.getFullYear()) }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Expenses" />
      <div className="flex-1 p-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center"><p className="text-gray-400 text-xs mb-1">This Month Total</p><p className="text-2xl font-bold text-gray-900">{fmt(summary?.total || 0)}</p></div>
          {(summary?.byCategory || []).slice(0,2).map((c: any) => (
            <div key={c.category} className="card text-center">
              <p className="text-gray-400 text-xs mb-1">{c.category}</p>
              <p className="text-xl font-bold text-gray-900">{fmt(c._sum.amount || 0)}</p>
              <span className={`badge mt-1 ${c.status==='APPROVED' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16}/> Log Expense
          </button>
        </div>

        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Category','Amount','Description','Month','Status','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {data?.data?.map((e: any) => (
                <tr key={e.id} className="table-row">
                  <td className="px-4 py-3"><span className="badge badge-gray">{e.category}</span></td>
                  <td className="px-4 py-3 font-semibold">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{e.description}</td>
                  <td className="px-4 py-3 text-gray-500">{MONTHS[e.month-1]} {e.year}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status}/></td>
                  <td className="px-4 py-3 text-gray-400">{format(new Date(e.createdAt),'dd MMM')}</td>
                </tr>
              ))}
              {!data?.data?.length && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No expenses yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold mb-5">Log Expense</h3>
            <div className="space-y-4">
              <div><label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="label">Amount (₹) *</label><input className="input" type="number" min="1" value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))}/></div>
              <div><label className="label">Description *</label><input className="input" value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Month</label>
                  <select className="input" value={form.month} onChange={e => setForm(f=>({...f,month:e.target.value}))}>
                    {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div><label className="label">Year</label><input className="input" type="number" value={form.year} onChange={e => setForm(f=>({...f,year:e.target.value}))}/></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => createMutation.mutate()} disabled={!form.amount || !form.description || createMutation.isPending} className="btn-primary flex-1">
                {createMutation.isPending ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
