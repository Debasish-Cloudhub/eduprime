'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, coursesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { Eye, ArrowRight, IndianRupee } from 'lucide-react';
import Link from 'next/link';

const NEXT_STATUS: Record<string, string> = {
  NEW: 'INITIATED', INITIATED: 'IN_PROGRESS', IN_PROGRESS: 'DOCS_SUBMITTED',
  DOCS_SUBMITTED: 'OFFER_RECEIVED', OFFER_RECEIVED: 'ENROLLED', ENROLLED: 'WON',
};

export default function SalesLeadsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-leads', status, search, page],
    queryFn: () => leadsApi.getAll({ status: status || undefined, search: search || undefined, page, limit: 20 }).then(r => r.data),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, toStatus }: any) => leadsApi.transition(id, { status: toStatus }),
    onSuccess: (_, v) => { toast.success(`Moved to ${v.toStatus.replace('_', ' ')}`); qc.invalidateQueries({ queryKey: ['my-leads'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const STATUSES = ['', 'NEW', 'INITIATED', 'IN_PROGRESS', 'DOCS_SUBMITTED', 'OFFER_RECEIVED', 'ENROLLED', 'WON', 'LOST'];

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Leads" />
      <div className="flex-1 p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input className="input max-w-xs" placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${status === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Student', 'Phone', 'City', 'College / Course', 'Status', 'SLA', 'Incentive', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading…</td></tr>}
              {data?.data?.map((lead: any) => (
                <tr key={lead.id} className="table-row">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{lead.studentName}</p>
                    <p className="text-xs text-gray-400">{lead.source}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.studentPhone}</td>
                  <td className="px-4 py-3 text-gray-500">{lead.city || '—'}</td>
                  <td className="px-4 py-3">
                    {lead.college ? (
                      <div>
                        <p className="text-xs font-medium text-gray-700 truncate max-w-36">{lead.college.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-36">{lead.course?.name}</p>
                      </div>
                    ) : <span className="text-xs text-gray-300">Not set</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={lead.slaStatus} /></td>
                  <td className="px-4 py-3">
                    {lead.incentiveAmount ? (
                      <span className="flex items-center gap-0.5 text-green-700 font-semibold text-xs">
                        <IndianRupee size={11}/>{Number(lead.incentiveAmount).toLocaleString('en-IN')}
                      </span>
                    ) : lead.course?.fees ? (
                      <span className="text-xs text-gray-400">~est.</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/leads/${lead.id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye size={14}/></Link>
                      {NEXT_STATUS[lead.status] && (
                        <button
                          onClick={() => transitionMutation.mutate({ id: lead.id, toStatus: NEXT_STATUS[lead.status] })}
                          className="flex items-center gap-0.5 px-2 py-1 rounded bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100"
                          title={`Move to ${NEXT_STATUS[lead.status]}`}
                        >
                          <ArrowRight size={12}/>{NEXT_STATUS[lead.status].replace('_',' ')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.data?.length && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No leads found</td></tr>
              )}
            </tbody>
          </table>
          {data?.meta && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">{data.meta.total} leads</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1 px-3">Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= data.meta.totalPages} className="btn-secondary text-sm py-1 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
