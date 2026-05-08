'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, incentivesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatCard from '@/components/ui/StatCard';
import { DollarSign, CheckCircle, Clock, Award, X, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { exportToExcel, exportToPDF } from '@/lib/export';

export default function FinanceDashboard() {
  const qc = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  // Payout modal
  const [payTarget, setPayTarget]     = useState<any>(null);
  const [payForm, setPayForm]         = useState({ paymentMode: 'BANK', paymentRef: '', paymentRemarks: '' });
  // Incentive actions
  const [incRejectTarget, setIncRejectTarget] = useState<any>(null);
  const [incRejectReason, setIncRejectReason] = useState('');
  const [incDeleteId, setIncDeleteId]         = useState<string|null>(null);
  // Bulk select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPayForm, setBulkPayForm] = useState({ paymentMode: 'BANK', paymentRef: '', paymentRemarks: '' });
  const [showBulkPay, setShowBulkPay] = useState(false);
  // Month filter for incentives
  const [incMonth, setIncMonth] = useState('');

  const { data: expenses }   = useQuery({ queryKey: ['expenses-all'],   queryFn: () => expensesApi.getAll({ limit: 200 }).then(r => r.data) });
  const { data: incentives } = useQuery({ queryKey: ['incentives-all'], queryFn: () => incentivesApi.getAll({ limit: 200 }).then(r => r.data) });

  const approve = useMutation({
    mutationFn: (id: string) => expensesApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses-all'] }); toast.success('Expense approved'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Approve failed'),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => expensesApi.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses-all'] });
      toast.success('Expense rejected');
      setRejectTarget(null);
      setRejectReason('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Reject failed'),
  });

  const approveInc = useMutation({
    mutationFn: (id: string) => incentivesApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['incentives-all'] }); toast.success('Incentive approved & locked'); },
  });
  const rejectInc = useMutation({
    mutationFn: ({id,reason}:{id:string;reason:string}) => incentivesApi.reject(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['incentives-all'] }); toast.success('Incentive rejected'); setIncRejectTarget(null); setIncRejectReason(''); },
  });
  const deleteInc = useMutation({
    mutationFn: (id: string) => incentivesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['incentives-all'] }); toast.success('Incentive deleted'); setIncDeleteId(null); },
  });

  const markPaid = useMutation({
    mutationFn: ({ id, details }: { id: string; details: any }) => incentivesApi.markPaid(id, details),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incentives-all'] });
      toast.success('Incentive marked as paid!');
      setPayTarget(null);
      setPayForm({ paymentMode:'BANK', paymentRef:'', paymentRemarks:'' });
      setSelectedIds(new Set());
      setShowBulkPay(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const bulkMarkPaid = () => {
    if (selectedIds.size === 0) return;
    Promise.all(Array.from(selectedIds).map(id => incentivesApi.markPaid(id, bulkPayForm)))
      .then(() => {
        qc.invalidateQueries({ queryKey: ['incentives-all'] });
        toast.success(`${selectedIds.size} incentives marked as paid!`);
        setSelectedIds(new Set()); setShowBulkPay(false);
        setBulkPayForm({ paymentMode:'BANK', paymentRef:'', paymentRemarks:'' });
      }).catch(() => toast.error('Some payments failed'));
  };

  const expList: any[]  = expenses?.expenses  || expenses?.data  || [];
  const incList: any[]  = incentives?.incentives || incentives?.data || [];
  const pending  = expList.filter(e => e.status === 'PENDING');
  const approved = expList.filter(e => e.status === 'APPROVED');
  const rejected = expList.filter(e => e.status === 'REJECTED');
  const unpaid   = incList.filter(i => !i.paidAt);
  const totalUnpaid = unpaid.reduce((s, i) => s + (i.amount || i.incentiveAmount || 0), 0);
  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  // Excel exports
  const exportExpensesExcel = () => {
    const rows = expList.map(e => ({
      Agent: e.agent?.name || '', Category: e.category,
      Amount: fmt(e.amount), Description: e.description || '',
      'Month/Year': `${e.month}/${e.year}`, Status: e.status,
      'Rejection Reason': e.rejectionReason || '',
      Date: e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : '',
    }));
    exportToExcel(rows, `All_Expenses_${new Date().toISOString().slice(0,10)}`, 'Expenses');
    toast.success('Expenses Excel downloaded!');
  };

  const exportIncentivesExcel = () => {
    const rows = incList.map(i => ({
      Agent: i.agent?.name || '', Student: i.lead?.studentName || '',
      College: i.lead?.college?.name || '', Course: i.lead?.course?.name || '',
      Amount: fmt(i.amount || i.incentiveAmount || 0), Type: i.incentiveType || '',
      Status: i.paidAt ? 'PAID' : 'PENDING',
      'Paid On': i.paidAt ? new Date(i.paidAt).toLocaleDateString('en-IN') : '',
    }));
    exportToExcel(rows, `All_Incentives_${new Date().toISOString().slice(0,10)}`, 'Incentives');
    toast.success('Incentives Excel downloaded!');
  };

  const exportExpensesPDF = async () => {
    const cols = ['Agent','Category','Amount','Description','Month','Status','Date'];
    const rows = expList.map(e => [
      e.agent?.name||'', e.category, fmt(e.amount), e.description||'',
      `${e.month}/${e.year}`, e.status,
      e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : '',
    ]);
    await exportToPDF(cols, rows, 'All Expenses Report — ISCC Digital', `All_Expenses_${new Date().toISOString().slice(0,10)}`);
    toast.success('Expenses PDF downloaded!');
  };

  const exportIncentivesPDF = async () => {
    const cols = ['Agent','Student','College','Course','Amount','Status','Date'];
    const rows = incList.map(i => [
      i.agent?.name||'', i.lead?.studentName||'', i.lead?.college?.name||'',
      i.lead?.course?.name||'', fmt(i.amount||i.incentiveAmount||0),
      i.paidAt ? 'PAID' : 'PENDING',
      i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-IN') : '',
    ]);
    await exportToPDF(cols, rows, 'All Incentives Report — ISCC Digital', `All_Incentives_${new Date().toISOString().slice(0,10)}`);
    toast.success('Incentives PDF downloaded!');
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Finance Dashboard" subtitle="Approve expenses and manage incentive payouts" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pending Approvals" value={pending.length}  icon={<Clock className="w-5 h-5" />}        color="amber"  />
          <StatCard title="Approved"           value={approved.length} icon={<CheckCircle className="w-5 h-5" />} color="green"  />
          <StatCard title="Unpaid Incentives"  value={unpaid.length}   icon={<Award className="w-5 h-5" />}       color="blue"   />
          <StatCard title="Total Payable"      value={fmt(totalUnpaid)} icon={<DollarSign className="w-5 h-5" />} color="purple" />
        </div>

        {/* ── EXPENSES SECTION ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Expense Management
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pending.length} pending</span>
            </h3>
            <div className="flex gap-2">
              <button onClick={exportExpensesExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={exportExpensesPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Agent','Category','Amount','Description','Month','Status','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium text-xs uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {expList.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No expenses found</td></tr>
                ) : expList.map((exp: any) => (
                  <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-900">{exp.agent?.name || '—'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{exp.category}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-900">{fmt(exp.amount)}</td>
                    <td className="py-3 px-3 text-gray-500 max-w-[180px] truncate">{exp.description || '—'}</td>
                    <td className="py-3 px-3 text-gray-500">{exp.month}/{exp.year}</td>
                    <td className="py-3 px-3">
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${exp.status==='APPROVED' ? 'bg-green-100 text-green-700' :
                            exp.status==='REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {exp.status}
                        </span>
                        {exp.rejectionReason && (
                          <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={exp.rejectionReason}>
                            {exp.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {exp.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approve.mutate(exp.id)}
                            disabled={approve.isPending}
                            className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 font-medium disabled:opacity-50">
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectTarget(exp); setRejectReason(''); }}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 font-medium">
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── INCENTIVES SECTION ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              Incentive Payouts
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{unpaid.length} unpaid</span>
            </h3>
            <div className="flex gap-2 flex-wrap">
              {selectedIds.size > 0 && (
                <button onClick={() => setShowBulkPay(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 font-medium">
                  Pay {selectedIds.size} Selected
                </button>
              )}
              <button onClick={exportIncentivesExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={exportIncentivesPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Agent','Student','College','Course','Amount','Status','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium text-xs uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {incList.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No incentives found</td></tr>
                ) : incList.map((inc: any) => (
                  <tr key={inc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-900">{inc.agent?.name || '—'}</td>
                    <td className="py-3 px-3 text-gray-700">{inc.lead?.studentName || '—'}</td>
                    <td className="py-3 px-3 text-gray-500 text-xs max-w-[140px] truncate">{inc.lead?.college?.name || '—'}</td>
                    <td className="py-3 px-3 text-gray-500 text-xs max-w-[140px] truncate">{inc.lead?.course?.name || '—'}</td>
                    <td className="py-3 px-3 font-bold text-green-700">{fmt(inc.amount || inc.incentiveAmount || 0)}</td>
                    <td className="py-3 px-3">
                      {inc.paidAt
                        ? <span className="flex items-center gap-1 text-green-700 text-xs font-medium"><CheckCircle size={12}/>Paid {format(new Date(inc.paidAt),'dd MMM')}</span>
                        : <span className="flex items-center gap-1 text-amber-600 text-xs font-medium"><Clock size={12}/>Pending</span>}
                    </td>
                    <td className="py-3 px-3">
                      {!inc.paidAt && (
                        <button onClick={() => { setPayTarget(inc); setPayForm({ paymentMode:'BANK', paymentRef:'', paymentRemarks:'' }); }} disabled={markPaid.isPending}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 font-medium disabled:opacity-50">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject with Reason Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Reject Expense</h3>
                  <p className="text-xs text-gray-500">{rejectTarget.agent?.name} · {rejectTarget.category} · ₹{Number(rejectTarget.amount).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setRejectTarget(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <label className="label">Reason for Rejection *</label>
              <textarea
                className="input mt-1"
                rows={4}
                placeholder="Please provide a clear reason for rejecting this expense..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2">This reason will be visible to the sales agent.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setRejectTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
                  reject.mutate({ id: rejectTarget.id, reason: rejectReason.trim() });
                }}
                disabled={reject.isPending}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50">
                {reject.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payout Details Modal ── */}
      {payTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPayTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Record Payment</h3>
            <p className="text-sm text-gray-500 mb-5">
              {payTarget.agent?.name} · {payTarget.lead?.course?.name || 'Course'} · ₹{Number(payTarget.amount||payTarget.incentiveAmount||0).toLocaleString()}
            </p>
            <div className="space-y-3">
              <div>
                <label className="label">Payment Mode *</label>
                <select className="input" value={payForm.paymentMode} onChange={e => setPayForm(f=>({...f,paymentMode:e.target.value}))}>
                  {['BANK','UPI','CHEQUE','CASH'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Reference / Transaction ID</label>
                <input className="input" value={payForm.paymentRef} onChange={e => setPayForm(f=>({...f,paymentRef:e.target.value}))} placeholder="e.g. UTR123456 / Cheque No." />
              </div>
              <div>
                <label className="label">Remarks (optional)</label>
                <input className="input" value={payForm.paymentRemarks} onChange={e => setPayForm(f=>({...f,paymentRemarks:e.target.value}))} placeholder="Any notes about this payment" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setPayTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => markPaid.mutate({ id: payTarget.id, details: payForm })}
                disabled={markPaid.isPending}
                className="btn-primary flex-1">
                {markPaid.isPending ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Pay Modal ── */}
      {showBulkPay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBulkPay(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Bulk Payment</h3>
            <p className="text-sm text-gray-500 mb-5">Recording payment for {selectedIds.size} incentives</p>
            <div className="space-y-3">
              <div>
                <label className="label">Payment Mode *</label>
                <select className="input" value={bulkPayForm.paymentMode} onChange={e => setBulkPayForm(f=>({...f,paymentMode:e.target.value}))}>
                  {['BANK','UPI','CHEQUE','CASH'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Reference / Transaction ID</label>
                <input className="input" value={bulkPayForm.paymentRef} onChange={e => setBulkPayForm(f=>({...f,paymentRef:e.target.value}))} placeholder="Batch payment reference" />
              </div>
              <div>
                <label className="label">Remarks</label>
                <input className="input" value={bulkPayForm.paymentRemarks} onChange={e => setBulkPayForm(f=>({...f,paymentRemarks:e.target.value}))} placeholder="e.g. May 2026 batch payout" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowBulkPay(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={bulkMarkPaid} disabled={markPaid.isPending} className="btn-primary flex-1">
                Pay {selectedIds.size} Incentives
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Reject Incentive Modal */}
      {incRejectTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIncRejectTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-1">Reject Incentive</h3>
            <p className="text-sm text-gray-500 mb-4">{incRejectTarget.agent?.name} · ₹{Number(incRejectTarget.amount||incRejectTarget.incentiveAmount||0).toLocaleString()}</p>
            <label className="label">Rejection Reason</label>
            <textarea className="input h-20 resize-none mb-4" value={incRejectReason}
              onChange={e => setIncRejectReason(e.target.value)} placeholder="Why is this incentive being rejected?" />
            <div className="flex gap-3">
              <button onClick={() => setIncRejectTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => rejectInc.mutate({ id: incRejectTarget.id, reason: incRejectReason })}
                disabled={!incRejectReason.trim() || rejectInc.isPending}
                className="flex-1 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Incentive Confirm */}
      {incDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIncDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">Delete Incentive?</h3>
            <p className="text-gray-500 text-sm mb-5">This permanently removes the incentive record. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIncDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => deleteInc.mutate(incDeleteId!)} disabled={deleteInc.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50">
                {deleteInc.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}