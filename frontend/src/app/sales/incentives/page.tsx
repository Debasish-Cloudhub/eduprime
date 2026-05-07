'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { incentivesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { DollarSign, Lock, CheckCircle, Clock, FileSpreadsheet, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF } from '@/lib/export';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SalesIncentivesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  const { data } = useQuery({
    queryKey: ['my-incentives', month, year],
    queryFn: () => incentivesApi.myIncentives({ month, year }).then(r => r.data),
  });

  const { data: allData } = useQuery({
    queryKey: ['my-incentives-all'],
    queryFn: () => incentivesApi.myIncentives({ limit: 500 }).then(r => r.data),
  });

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const incentives: any[] = data?.incentives || data?.data || [];
  const allIncentives: any[] = allData?.incentives || allData?.data || [];

  const totalLocked = incentives.filter((i:any) => !i.paidAt).reduce((s:number, i:any) => s + (i.incentiveAmount || i.amount || 0), 0);
  const totalPaid   = incentives.filter((i:any) =>  i.paidAt).reduce((s:number, i:any) => s + (i.incentiveAmount || i.amount || 0), 0);

  const doExcel = () => {
    const rows = allIncentives.map((i:any) => ({
      'Student':       i.lead?.studentName || '',
      'College':       i.lead?.college?.name || '',
      'Course':        i.lead?.course?.name || '',
      'Amount':        `₹${Number(i.incentiveAmount || i.amount || 0).toLocaleString()}`,
      'Type':          i.incentiveType || '',
      'Status':        i.paidAt ? 'PAID' : 'PENDING',
      'Paid On':       i.paidAt ? new Date(i.paidAt).toLocaleDateString('en-IN') : '',
      'Created':       i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-IN') : '',
    }));
    exportToExcel(rows, `My_Incentives_${new Date().toISOString().slice(0,10)}`, 'Incentives');
    toast.success('Excel downloaded!');
  };

  const doPDF = async () => {
    const cols = ['Student','College','Course','Amount','Type','Status','Date'];
    const rows = allIncentives.map((i:any) => [
      i.lead?.studentName||'', i.lead?.college?.name||'', i.lead?.course?.name||'',
      fmt(i.incentiveAmount || i.amount || 0), i.incentiveType||'',
      i.paidAt ? 'PAID' : 'PENDING',
      i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-IN') : '',
    ]);
    await exportToPDF(cols, rows, 'My Incentives Report — ISCC Digital', `My_Incentives_${new Date().toISOString().slice(0,10)}`);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Incentives" subtitle="Track earnings from enrolled students" />
      <div className="flex-1 p-6">

        {/* Period + export */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select className="input w-28" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select className="input w-24" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
          </select>
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

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Incentives', value:incentives.length,  icon:DollarSign,   color:'blue'   },
            { label:'Locked (unpaid)',  value:fmt(totalLocked),   icon:Lock,         color:'amber'  },
            { label:'Paid Out',         value:fmt(totalPaid),     icon:CheckCircle,  color:'green'  },
            { label:'Pending',          value:incentives.filter((i:any)=>!i.paidAt).length, icon:Clock, color:'purple' },
          ].map(({ label, value, icon:Icon, color }) => (
            <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 text-${color}-600`} />
                <span className="text-xs font-medium text-gray-500">{label}</span>
              </div>
              <div className="text-2xl font-black text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Student','College','Course','Amount','Type','Status','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {incentives.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No incentives for this period</td></tr>
              ) : incentives.map((inc: any) => (
                <tr key={inc.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">{inc.lead?.studentName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{inc.lead?.college?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{inc.lead?.course?.name || '—'}</td>
                  <td className="px-4 py-3 font-bold text-green-700">{fmt(inc.incentiveAmount || inc.amount || 0)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{inc.incentiveType || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {inc.paidAt
                      ? <span className="flex items-center gap-1 text-green-700 text-xs font-medium"><CheckCircle size={12}/>Paid</span>
                      : <span className="flex items-center gap-1 text-amber-600 text-xs font-medium"><Lock size={12}/>Locked</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {inc.createdAt ? format(new Date(inc.createdAt), 'dd MMM yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
