'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, incentivesApi, analyticsApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatCard from '@/components/ui/StatCard';
import { DollarSign, CheckCircle, XCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function FinanceDashboard() {
  const qc = useQueryClient();
  const { data: expenses } = useQuery({ queryKey: ['expenses'], queryFn: () => expensesApi.getAll({ limit: 50 }) });
  const { data: incentives } = useQuery({ queryKey: ['incentives'], queryFn: () => incentivesApi.getAll({ limit: 50 }) });
  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: () => analyticsApi.dashboard() });

  const approve = useMutation({ mutationFn: (id: string) => expensesApi.approve(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Expense approved'); } });
  const reject = useMutation({ mutationFn: ({ id, reason }: any) => expensesApi.reject(id, reason), onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Expense rejected'); } });
  const markPaid = useMutation({ mutationFn: (id: string) => incentivesApi.markPaid(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['incentives'] }); toast.success('Incentive marked as paid'); } });

  const expList = expenses?.data?.expenses || [];
  const incList = incentives?.data?.incentives || [];
  const pending = expList.filter((e: any) => e.status === 'PENDING');
  const unpaid = incList.filter((i: any) => !i.paidAt);
  const totalUnpaid = unpaid.reduce((s: number, i: any) => s + (i.amount || 0), 0);

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Finance Dashboard" subtitle="Manage expenses and incentive payouts" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pending Approvals" value={pending.length} icon={Clock} color="yellow" />
          <StatCard title="Approved This Month" value={expList.filter((e: any) => e.status === 'APPROVED').length} icon={CheckCircle} color="green" />
          <StatCard title="Unpaid Incentives" value={unpaid.length} icon={Award} color="blue" />
          <StatCard title="Total Payable" value={`₹${totalUnpaid.toLocaleString()}`} icon={DollarSign} color="purple" />
        </div>

        {/* Pending Expenses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-yellow-500" />Pending Expense Approvals ({pending.length})</h3>
          {pending.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No pending expenses</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">{['Agent', 'Category', 'Amount', 'Description', 'Date', 'Actions'].map(h => <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium text-xs">{h}</th>)}</tr></thead>
                <tbody>
                  {pending.map((exp: any) => (
                    <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{exp.agent?.name || '—'}</td>
                      <td className="py-3 px-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{exp.category}</span></td>
                      <td className="py-3 px-3 font-semibold text-gray-900">₹{exp.amount?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-gray-500 max-w-xs truncate">{exp.description}</td>
                      <td className="py-3 px-3 text-gray-500">{new Date(exp.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button onClick={() => approve.mutate(exp.id)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Approve</button>
                          <button onClick={() => reject.mutate({ id: exp.id, reason: 'Rejected by finance' })} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Unpaid Incentives */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-blue-500" />Unpaid Incentives ({unpaid.length})</h3>
          {unpaid.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No unpaid incentives</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">{['Agent', 'Lead', 'Amount', 'Source', 'Date', 'Action'].map(h => <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium text-xs">{h}</th>)}</tr></thead>
                <tbody>
                  {unpaid.map((inc: any) => (
                    <tr key={inc.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{inc.agent?.name || '—'}</td>
                      <td className="py-3 px-3 text-gray-600">{inc.lead?.name || '—'}</td>
                      <td className="py-3 px-3 font-semibold text-blue-700">₹{inc.amount?.toLocaleString()}</td>
                      <td className="py-3 px-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{inc.source}</span></td>
                      <td className="py-3 px-3 text-gray-500">{new Date(inc.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <button onClick={() => markPaid.mutate(inc.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Mark Paid</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
