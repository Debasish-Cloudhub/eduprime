'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function useExportExpenses(data: any) {
  const exportExcel = () => {
    const rows = (data?.expenses || []).map((e: any) => ({
      'Agent': e.agent?.name||'', 'Category': e.category,
      'Amount': Number(e.amount), 'Description': e.description||'',
      'Month': e.month, 'Year': e.year, 'Status': e.status,
      'Rejection Reason': e.rejectionReason||'',
      'Date': new Date(e.createdAt).toLocaleDateString('en-IN'),
    }));
    exportToExcel(rows, `All_Expenses_${new Date().toISOString().slice(0,10)}`, 'Expenses');
  };
  const exportPDF = async () => {
    const cols = ['Agent','Category','Amount','Month/Year','Status'];
    const rows = (data?.expenses || []).map((e: any) => [e.agent?.name||'', e.category, `₹${Number(e.amount).toLocaleString()}`, `${e.month}/${e.year}`, e.status]);
    await exportToPDF(cols, rows, 'All Expenses — ISCC Digital', `All_Expenses_${new Date().toISOString().slice(0,10)}`);
  };
  return { exportExcel, exportPDF };
}

export default function AdminExpensesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'list'|'summary'>('list');
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState<string|null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', status, page],
    queryFn: () => expensesApi.getAll({ status: status || undefined, page, limit: 20 }).then(r => r.data),
  });

  const { data: summary } = useQuery({
    queryKey: ['expenses-summary', new Date().getFullYear()],
    queryFn: () => expensesApi.getMonthlySummary(new Date().getFullYear()).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => expensesApi.approve(id),
    onSuccess: () => { toast.success('Expense approved'); qc.invalidateQueries({ queryKey: ['expenses'] }); },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: any) => expensesApi.reject(id, reason),
    onSuccess: () => { toast.success('Expense rejected'); qc.invalidateQueries({ queryKey: ['expenses'] }); setRejectId(null); setRejectReason(''); },
  });

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Expense Management" />
      <div className="flex-1 p-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab==='list' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Expense List</button>
          <button onClick={() => setTab('summary')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab==='summary' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Monthly Summary</button>
        </div>

        {tab === 'list' && (
          <>
            <div className="flex gap-3 mb-4">
              {['PENDING','APPROVED','REJECTED',''].map(s => (
                <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status===s ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>

            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Agent','Category','Amount','Description','Month','Status','Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>}
                  {data?.data?.map((exp: any) => (
                    <tr key={exp.id} className="table-row">
                      <td className="px-4 py-3 font-medium text-gray-900">{exp.agent?.name}</td>
                      <td className="px-4 py-3"><span className="badge badge-gray">{exp.category}</span></td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{fmt(exp.amount)}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{exp.description}</td>
                      <td className="px-4 py-3 text-gray-500">{MONTHS[exp.month-1]} {exp.year}</td>
                      <td className="px-4 py-3"><StatusBadge status={exp.status}/></td>
                      <td className="px-4 py-3">
                        {exp.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => approveMutation.mutate(exp.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Approve">
                              <CheckCircle size={16}/>
                            </button>
                            <button onClick={() => setRejectId(exp.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Reject">
                              <XCircle size={16}/>
                            </button>
                          </div>
                        )}
                        {exp.rejectedReason && <span className="text-xs text-gray-400 italic">{exp.rejectedReason}</span>}
                      </td>
                    </tr>
                  ))}
                  {!isLoading && !data?.data?.length && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No expenses found</td></tr>}
                </tbody>
              </table>
              {data?.meta && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-500">Total: {data.meta.total}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-secondary text-sm py-1 px-3">Prev</button>
                    <button onClick={() => setPage(p => p+1)} disabled={page >= data.meta.totalPages} className="btn-secondary text-sm py-1 px-3">Next</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'summary' && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Monthly Approved Expenses — {new Date().getFullYear()}</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={(summary||[]).map((r:any) => ({ ...r, name: MONTHS[r.month-1] }))}>
                <XAxis dataKey="name" tick={{fontSize:12}}/>
                <YAxis tick={{fontSize:11}} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={(v:any) => fmt(v)}/>
                <Bar dataKey="totalApproved" fill="#3b82f6" radius={[4,4,0,0]} name="Approved"/>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-4 gap-4 mt-6">
              {(summary||[]).filter((r:any)=>r.totalApproved>0).map((r:any) => (
                <div key={r.month} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{MONTHS[r.month-1]}</p>
                  <p className="font-bold text-gray-900 mt-1">{fmt(r.totalApproved)}</p>
                  <p className="text-xs text-gray-400">{r.count} expenses</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold mb-4">Reject Expense</h3>
            <label className="label">Reason *</label>
            <textarea className="input h-24 resize-none mb-4" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection…"/>
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })} disabled={!rejectReason.trim()} className="btn-danger flex-1">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
