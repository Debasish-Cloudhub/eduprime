'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { incentivesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { DollarSign, Lock, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SalesIncentivesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data } = useQuery({
    queryKey: ['my-incentives', month, year],
    queryFn: () => incentivesApi.myIncentives({ month, year }).then(r => r.data),
  });

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Incentives" />
      <div className="flex-1 p-6">

        {/* Period selector */}
        <div className="flex gap-3 mb-6">
          <select className="input w-28" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="input w-24" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Earned', value: fmt(data?.summary?.totalLocked || 0), icon: <DollarSign size={20}/>, color: 'bg-brand-50 text-brand-700' },
            { label: 'Paid Out', value: fmt(data?.summary?.totalPaid || 0), icon: <CheckCircle size={20}/>, color: 'bg-green-50 text-green-700' },
            { label: 'Pending', value: fmt((data?.summary?.totalLocked || 0) - (data?.summary?.totalPaid || 0)), icon: <Clock size={20}/>, color: 'bg-amber-50 text-amber-700' },
          ].map(s => (
            <div key={s.label} className={`card flex items-center gap-3 ${s.color.split(' ')[0]} border-0`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div><p className="text-xs opacity-70">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
            </div>
          ))}
        </div>

        {/* Records Table */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Student', 'Course', 'Fees at Closure', 'Incentive', 'Basis', 'Locked On', 'Paid'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.records || []).map((r: any) => (
                <tr key={r.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.lead?.studentName}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-36 truncate">{r.course?.name}</td>
                  <td className="px-4 py-3">{fmt(r.feesAtClosure)}</td>
                  <td className="px-4 py-3 font-bold text-green-700 text-base">{fmt(r.incentiveAmount)}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-blue text-xs">
                      {r.incentiveSource === 'EXCEL_FIXED' ? 'Fixed' : `${r.incentivePctUsed || 5}%`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                    <Lock size={12} className="text-green-600"/>
                    {r.lockedAt ? format(new Date(r.lockedAt), 'dd MMM yy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {r.paidAt
                      ? <span className="badge badge-success">Paid {format(new Date(r.paidAt), 'dd MMM')}</span>
                      : <span className="badge badge-warning">Pending</span>}
                  </td>
                </tr>
              ))}
              {!data?.records?.length && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No incentive records for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
