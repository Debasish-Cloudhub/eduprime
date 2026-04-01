'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, slaApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, TrendingUp, DollarSign, AlertTriangle,
  CheckCircle, Clock, XCircle,
} from 'lucide-react';

const FUNNEL_COLORS = ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#7c3aed','#16a34a','#dc2626'];

export default function AdminDashboard() {
  const { data: dash } = useQuery({ queryKey: ['dashboard'], queryFn: () => analyticsApi.dashboard().then(r => r.data) });
  const { data: funnel } = useQuery({ queryKey: ['funnel'], queryFn: () => analyticsApi.funnel().then(r => r.data) });
  const { data: leaderboard } = useQuery({ queryKey: ['leaderboard'], queryFn: () => analyticsApi.leaderboard().then(r => r.data) });
  const { data: trend } = useQuery({ queryKey: ['trend'], queryFn: () => analyticsApi.leadTrend({ days: 30 }).then(r => r.data) });
  const { data: rvE } = useQuery({ queryKey: ['rve'], queryFn: () => analyticsApi.revenueVsExpense(new Date().getFullYear()).then(r => r.data) });
  const { data: sla } = useQuery({ queryKey: ['sla-summary'], queryFn: () => slaApi.getSummary().then(r => r.data) });

  const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n?.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Admin Dashboard" />
      <div className="flex-1 p-6 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Leads"      value={dash?.totalLeads ?? '—'}       icon={<Users size={20}/>}         color="blue" />
          <StatCard title="Won"              value={dash?.wonLeads ?? '—'}          icon={<CheckCircle size={20}/>}   color="green" />
          <StatCard title="Conversion Rate"  value={`${dash?.conversionRate ?? 0}%`} icon={<TrendingUp size={20}/>}  color="purple" />
          <StatCard title="SLA Breached"     value={sla?.breached ?? '—'}           icon={<AlertTriangle size={20}/>} color="red" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Leads"     value={dash?.activeLeads ?? '—'}       icon={<Clock size={20}/>}        color="blue" />
          <StatCard title="Incentives Locked" value={fmt(dash?.totalIncentiveLocked ?? 0)} icon={<DollarSign size={20}/>} color="green" />
          <StatCard title="SLA At Risk"      value={sla?.atRisk ?? '—'}             icon={<AlertTriangle size={20}/>} color="amber" />
          <StatCard title="Pending Expenses" value={dash?.pendingExpenses ?? '—'}   icon={<XCircle size={20}/>}      color="amber" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Funnel */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Lead Funnel</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {(funnel || []).map((_: any, i: number) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Trend */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Lead Trend (30 days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total" />
                <Line type="monotone" dataKey="won"   stroke="#16a34a" strokeWidth={2} dot={false} name="Won" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Expense */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Incentives vs Expenses ({new Date().getFullYear()})</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={(rvE || []).filter((r: any) => r.incentives > 0 || r.expenses > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={m => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="incentives" fill="#3b82f6" radius={[4,4,0,0]} name="Incentives" />
                <Bar dataKey="expenses"   fill="#f59e0b" radius={[4,4,0,0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Agent Leaderboard */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Agent Leaderboard</h3>
            <div className="space-y-3">
              {(leaderboard || []).slice(0, 6).map((entry: any, i: number) => (
                <div key={entry.agent.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.agent.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min(entry.conversionRate, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{entry.conversionRate}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{entry.won} won</p>
                    <p className="text-xs text-gray-400">{entry.total} total</p>
                  </div>
                </div>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
