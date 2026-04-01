'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slaApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { AlertTriangle, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

export default function AdminSLAPage() {
  const qc = useQueryClient();
  const { data: summary } = useQuery({ queryKey: ['sla-summary'], queryFn: () => slaApi.getSummary().then(r => r.data) });
  const { data: breached, isLoading } = useQuery({ queryKey: ['sla-breached'], queryFn: () => slaApi.getBreached().then(r => r.data) });

  const triggerMutation = useMutation({
    mutationFn: () => fetch('/api/v1/sla/check', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    onSuccess: () => { toast.success('SLA check triggered'); qc.invalidateQueries({ queryKey: ['sla-breached'] }); },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="SLA Monitoring" />
      <div className="flex-1 p-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'On Track', value: summary?.onTrack ?? '—', icon: <CheckCircle size={20}/>, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'At Risk', value: summary?.atRisk ?? '—', icon: <Clock size={20}/>, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Breached', value: summary?.breached ?? '—', icon: <XCircle size={20}/>, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Total Active', value: summary?.total ?? '—', icon: <AlertTriangle size={20}/>, color: 'text-brand-700', bg: 'bg-brand-50' },
          ].map(c => (
            <div key={c.label} className={`card flex items-center gap-3 ${c.bg} border-0`}>
              <div className={c.color}>{c.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={15} className={triggerMutation.isPending ? 'animate-spin' : ''} />
            Run SLA Check Now
          </button>
        </div>

        {/* SLA Rules */}
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">SLA Rules</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { status: 'INITIATED', days: 7 },
              { status: 'IN_PROGRESS', days: 15 },
              { status: 'DOCS_SUBMITTED', days: 10 },
              { status: 'OFFER_RECEIVED', days: 5 },
            ].map(r => (
              <div key={r.status} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{r.status.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-gray-900">{r.days}</p>
                <p className="text-xs text-gray-400">days</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            ⚡ AT_RISK triggered 24h before deadline · BREACHED triggers agent + admin notification
          </p>
        </div>

        {/* Breached Leads */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <XCircle size={16} className="text-red-500" />
            <h3 className="font-semibold text-gray-800">Breached Leads</h3>
            {breached?.length > 0 && (
              <span className="ml-auto badge badge-danger">{breached.length} breached</span>
            )}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Phone', 'Status', 'Agent', 'Breached At', 'Duration', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>}
              {(breached || []).map((lead: any) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-red-50/30">
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.studentName}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.studentPhone}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 text-gray-600">{lead.agent?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {lead.slaBreachedAt ? format(new Date(lead.slaBreachedAt), 'dd MMM HH:mm') : '—'}
                  </td>
                  <td className="px-4 py-3 text-red-600 font-medium">
                    {lead.slaBreachedAt ? formatDistanceToNow(new Date(lead.slaBreachedAt), { addSuffix: true }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="text-brand-600 hover:underline text-xs font-medium">
                      View Lead →
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && !breached?.length && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
                    <p className="text-gray-400">No SLA breaches — all leads on track!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
