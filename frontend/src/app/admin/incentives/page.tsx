'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incentivesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { FileDown, DollarSign, Lock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';

export default function AdminIncentivesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState({ isPaid: '', isLocked: 'true', page: 1 });
  const [configPct, setConfigPct] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['incentives', filter],
    queryFn: () => incentivesApi.getAll({
      isPaid: filter.isPaid === '' ? undefined : filter.isPaid === 'true',
      isLocked: filter.isLocked === '' ? undefined : filter.isLocked === 'true',
      page: filter.page,
      limit: 20,
    }).then(r => r.data),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => incentivesApi.markPaid(id),
    onSuccess: () => { toast.success('Marked as paid!'); qc.invalidateQueries({ queryKey: ['incentives'] }); },
  });

  const updateConfigMutation = useMutation({
    mutationFn: () => api.post('/incentives/config', { key: 'DEFAULT_INCENTIVE_PCT', value: configPct }),
    onSuccess: () => { toast.success('Config updated!'); setShowConfig(false); setConfigPct(''); },
  });

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  // Totals
  const totalLocked = (data?.data || []).reduce((s: number, r: any) => s + Number(r.incentiveAmount), 0);
  const totalPaid = (data?.data || []).filter((r: any) => r.paidAt).reduce((s: number, r: any) => s + Number(r.incentiveAmount), 0);

  const exportExcel = () => {
    const rows = (data?.data || []).map((r: any) => ({
      'Agent': r.agent?.name||'', 'Course': r.lead?.course?.name||'',
      'Amount': Number(r.incentiveAmount||0), 'Type': r.incentiveType||'',
      'Locked': r.isLocked?'Yes':'No', 'Paid': r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN') : 'Pending',
      'Pay Mode': r.paymentMode||'', 'Ref': r.paymentRef||'',
    }));
    exportToExcel(rows, `Incentives_${new Date().toISOString().slice(0,10)}`, 'Incentives');
    toast.success('Excel downloaded!');
  };
  const exportPDF = async () => {
    const cols = ['Agent','Course','Amount','Type','Paid'];
    const rows = (data?.data || []).map((r: any) => [r.agent?.name||'', r.lead?.course?.name||'', fmt(Number(r.incentiveAmount||0)), r.incentiveType||'', r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN') : 'Pending']);
    await exportToPDF(cols, rows, 'Incentives Report — ISCC Digital', `Incentives_${new Date().toISOString().slice(0,10)}`);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Incentive Management" />
      <div className="flex-1 p-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card flex items-center gap-3 bg-blue-50 border-0">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><DollarSign size={20} className="text-blue-700"/></div>
            <div><p className="text-xs text-blue-600">Total Locked</p><p className="text-xl font-bold text-blue-900">{fmt(totalLocked)}</p></div>
          </div>
          <div className="card flex items-center gap-3 bg-green-50 border-0">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle size={20} className="text-green-700"/></div>
            <div><p className="text-xs text-green-600">Total Paid</p><p className="text-xl font-bold text-green-900">{fmt(totalPaid)}</p></div>
          </div>
          <div className="card flex items-center gap-3 bg-amber-50 border-0">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Lock size={20} className="text-amber-700"/></div>
            <div><p className="text-xs text-amber-600">Pending Payout</p><p className="text-xl font-bold text-amber-900">{fmt(totalLocked - totalPaid)}</p></div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mb-3">
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"><FileDown size={14}/> Excel</button>
          <button onClick={exportPDF}   className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"><FileDown size={14}/> PDF</button>
        </div>
    {/* Filters + Config */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select className="input w-36" value={filter.isLocked} onChange={e => setFilter(f => ({ ...f, isLocked: e.target.value, page: 1 }))}>
            <option value="">All</option>
            <option value="true">Locked</option>
            <option value="false">Unlocked</option>
          </select>
          <select className="input w-36" value={filter.isPaid} onChange={e => setFilter(f => ({ ...f, isPaid: e.target.value, page: 1 }))}>
            <option value="">All Payment</option>
            <option value="false">Unpaid</option>
            <option value="true">Paid</option>
          </select>
          <button onClick={() => setShowConfig(true)} className="btn-secondary ml-auto text-sm">
            ⚙ Set Default Incentive %
          </button>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Agent', 'Student', 'Course', 'Fees at Closure', 'Incentive', 'Source', 'Locked', 'Paid', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={9} className="text-center py-10 text-gray-400">Loading…</td></tr>}
              {data?.data?.map((r: any) => (
                <tr key={r.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.agent?.name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.lead?.studentName}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-32 truncate">{r.course?.name}</td>
                  <td className="px-4 py-3 font-medium">{fmt(r.feesAtClosure)}</td>
                  <td className="px-4 py-3 font-bold text-green-700 text-base">{fmt(r.incentiveAmount)}</td>
                  <td className="px-4 py-3"><span className="badge badge-blue">{r.incentiveSource?.replace('_',' ')}</span></td>
                  <td className="px-4 py-3">
                    {r.isLocked
                      ? <span className="text-xs text-green-600 font-medium">✓ {r.lockedAt ? format(new Date(r.lockedAt), 'dd MMM') : ''}</span>
                      : <span className="text-xs text-gray-400">Pending</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.paidAt
                      ? <span className="text-xs text-green-600">✓ {format(new Date(r.paidAt), 'dd MMM')}</span>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.isLocked && !r.paidAt && (
                      <button onClick={() => markPaidMutation.mutate(r.id)} className="btn-primary text-xs py-1 px-2">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.data?.length && <tr><td colSpan={9} className="text-center py-10 text-gray-400">No incentive records</td></tr>}
            </tbody>
          </table>
          {data?.meta && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">Total: {data.meta.total}</p>
              <div className="flex gap-2">
                <button onClick={() => setFilter(f => ({ ...f, page: Math.max(1, f.page - 1) }))} disabled={filter.page === 1} className="btn-secondary text-sm py-1 px-3">Prev</button>
                <button onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))} disabled={filter.page >= data.meta.totalPages} className="btn-secondary text-sm py-1 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold mb-1">Default Incentive %</h3>
            <p className="text-sm text-gray-500 mb-4">Applied when no fixed incentive is set on a course</p>
            <label className="label">Percentage (e.g. 5 = 5%)</label>
            <input className="input mb-4" type="number" min="0" max="100" step="0.5" value={configPct} onChange={e => setConfigPct(e.target.value)} placeholder="5" />
            <div className="flex gap-3">
              <button onClick={() => setShowConfig(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => updateConfigMutation.mutate()} disabled={!configPct || updateConfigMutation.isPending} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
