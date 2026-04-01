'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, incentivesApi, slaApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { Users, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function SalesDashboard() {
  const { user } = useAuth();
  const { data: dash } = useQuery({ queryKey: ['dashboard'], queryFn: () => analyticsApi.dashboard().then(r => r.data) });
  const { data: funnel } = useQuery({ queryKey: ['funnel'], queryFn: () => analyticsApi.funnel().then(r => r.data) });
  const { data: trend } = useQuery({ queryKey: ['trend'], queryFn: () => analyticsApi.leadTrend({ days: 30 }).then(r => r.data) });
  const { data: incentives } = useQuery({ queryKey: ['my-incentives'], queryFn: () => incentivesApi.myIncentives().then(r => r.data) });

  const fmt = (n: number) => `₹${n?.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title={`Welcome, ${user?.name?.split(' ')[0]} 👋`} />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Leads"         value={dash?.totalLeads ?? '—'}       icon={<Users size={20}/>}         color="blue"/>
          <StatCard title="Won"              value={dash?.wonLeads ?? '—'}          icon={<TrendingUp size={20}/>}    color="green"/>
          <StatCard title="Conversion Rate"  value={`${dash?.conversionRate ?? 0}%`} icon={<TrendingUp size={20}/>}  color="purple"/>
          <StatCard title="SLA Breached"     value={dash?.slaBreached ?? '—'}       icon={<AlertTriangle size={20}/>} color="red"/>
        </div>

        {/* Incentive summary */}
        <div className="card border-l-4 border-green-500 bg-green-50">
          <div className="flex items-center gap-3">
            <DollarSign size={24} className="text-green-700"/>
            <div>
              <p className="text-sm text-green-700 font-medium">Total Incentives Earned (Locked)</p>
              <p className="text-3xl font-bold text-green-900 mt-0.5">{fmt(incentives?.summary?.totalLocked ?? 0)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-green-600">{incentives?.summary?.count ?? 0} deals closed</p>
              <p className="text-xs text-green-500 mt-0.5">Paid: {fmt(incentives?.summary?.totalPaid ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">My Lead Funnel</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnel || []} layout="vertical">
                <XAxis type="number" tick={{fontSize:11}}/>
                <YAxis dataKey="status" type="category" tick={{fontSize:11}} width={110}/>
                <Tooltip/>
                <Bar dataKey="count" fill="#3b82f6" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Lead Trend (30d)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend||[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={d=>d.slice(5)}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip/>
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="won"   stroke="#16a34a" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent incentive records */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Incentive Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Student','Course','Fees','Incentive','Source','Locked'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(incentives?.records||[]).slice(0,8).map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{r.lead?.studentName}</td>
                    <td className="py-3 px-3 text-gray-600">{r.course?.name}</td>
                    <td className="py-3 px-3">{fmt(Number(r.feesAtClosure))}</td>
                    <td className="py-3 px-3 font-bold text-green-700">{fmt(Number(r.incentiveAmount))}</td>
                    <td className="py-3 px-3"><span className="badge badge-blue">{r.incentiveSource?.replace('_',' ')}</span></td>
                    <td className="py-3 px-3">{r.isLocked ? <span className="badge badge-success">Locked</span> : <span className="badge badge-gray">Pending</span>}</td>
                  </tr>
                ))}
                {!incentives?.records?.length && <tr><td colSpan={6} className="text-center py-6 text-gray-400">No records yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
