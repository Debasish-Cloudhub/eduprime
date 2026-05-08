'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { analyticsApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

export default function AdminAnalyticsPage() {
  const [agentId, setAgentId] = useState<string>('');
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: funnel } = useQuery({ queryKey: ['funnel', agentId], queryFn: () => analyticsApi.funnel().then(r => r.data) });
  const { data: sources } = useQuery({ queryKey: ['sources'], queryFn: () => analyticsApi.conversionBySource().then(r => r.data) });
  const { data: rvE } = useQuery({ queryKey: ['rve', year], queryFn: () => analyticsApi.revenueVsExpense(year).then(r => r.data) });
  const { data: leaderboard } = useQuery({ queryKey: ['leaderboard'], queryFn: () => analyticsApi.leaderboard().then(r => r.data) });
  const { data: agentsList } = useQuery({
    queryKey: ['agents-list'],
    queryFn: () => api.get('/users?role=SALES_AGENT&limit=50').then(r => r.data),
  });

  const { data: trend } = useQuery({ queryKey: ['trend-60'], queryFn: () => analyticsApi.leadTrend({ days: 60 }).then(r => r.data) });

  const fmt = (n: number) => `₹${(n / 1000).toFixed(0)}k`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Analytics & Reports" />
      <div className="flex-1 p-6 space-y-6">

        {/* Lead Trend */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Lead Activity — Last 60 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} interval={6} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Leads" />
              <Line type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} dot={false} name="Won" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Lead Funnel by Stage</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnel || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion by Source */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Conversion Rate by Source</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sources || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="conversionRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Conversion %" />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {(sources || []).map((s: any) => (
                <div key={s.source} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">{s.source}</p>
                  <p className="font-bold text-gray-900">{s.total}</p>
                  <p className="text-xs text-green-600">{s.won} won</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue vs Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Incentives vs Expenses</h3>
            <select className="input w-28 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(rvE || []).map((r: any) => ({ ...r, name: MONTHS[r.month - 1] }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={fmt} />
              <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="incentives" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Incentives Earned" />
              <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
          {/* Summary row */}
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600 font-medium">Total Incentives {year}</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ₹{((rvE || []).reduce((s: number, r: any) => s + r.incentives, 0) / 100000).toFixed(2)}L
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-600 font-medium">Total Expenses {year}</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                ₹{((rvE || []).reduce((s: number, r: any) => s + r.expenses, 0) / 100000).toFixed(2)}L
              </p>
            </div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-5">Agent Performance Leaderboard</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Rank', 'Agent', 'Total Leads', 'Won', 'Lost', 'Conversion', 'Incentive Earned'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(leaderboard || []).map((entry: any, i: number) => (
                  <tr key={entry.agent.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                        ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-900">{entry.agent.name}</p>
                      <p className="text-xs text-gray-400">{entry.agent.email}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{entry.total}</td>
                    <td className="py-3 px-3 font-semibold text-green-700">{entry.won}</td>
                    <td className="py-3 px-3 text-red-500">{entry.total - entry.won}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                          <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min(entry.conversionRate, 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{entry.conversionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-brand-700">
                      ₹{Number(entry.totalIncentive).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                {!leaderboard?.length && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No data yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
