'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, usersApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { Plus, Search, Filter, RefreshCw, Eye, UserCheck } from 'lucide-react';
import Link from 'next/link';

const STATUSES = ['NEW','INITIATED','IN_PROGRESS','DOCS_SUBMITTED','OFFER_RECEIVED','ENROLLED','WON','LOST'];
const SOURCES  = ['SULEKHA','WEBSITE','REFERRAL','WALK_IN','SOCIAL_MEDIA','OTHER'];

export default function AdminLeadsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, search, status, source],
    queryFn: () => leadsApi.getAll({ page, limit: 20, search: search || undefined, status: status || undefined, source: source || undefined }).then(r => r.data),
  });

  const { data: agents } = useQuery({ queryKey: ['agents'], queryFn: () => usersApi.getAgents().then(r => r.data) });

  const assignMutation = useMutation({
    mutationFn: ({ leadId, agentId }: any) => leadsApi.assign(leadId, agentId),
    onSuccess: () => { toast.success('Lead assigned'); qc.invalidateQueries({ queryKey: ['leads'] }); setShowAssign(null); },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Lead Management" />
      <div className="flex-1 p-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search name, phone, email…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input w-36" value={source} onChange={e => { setSource(e.target.value); setPage(1); }}>
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => qc.invalidateQueries({ queryKey: ['leads'] })} className="btn-secondary">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Lead
          </button>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Student','Phone','City','Source','Status','SLA','Agent','College/Course','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">Loading…</td></tr>
                )}
                {!isLoading && data?.data?.map((lead: any) => (
                  <tr key={lead.id} className="table-row">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{lead.studentName}</p>
                        <p className="text-xs text-gray-400">{lead.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.studentPhone}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.city || '—'}</td>
                    <td className="px-4 py-3"><span className="badge badge-gray">{lead.source}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={lead.slaStatus} /></td>
                    <td className="px-4 py-3 text-gray-600">{lead.agent?.name || <span className="text-gray-400">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      {lead.college ? (
                        <div>
                          <p className="text-xs font-medium text-gray-700">{lead.college.name}</p>
                          <p className="text-xs text-gray-400">{lead.course?.name}</p>
                        </div>
                      ) : <span className="text-gray-400 text-xs">Not set</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/leads/${lead.id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                          <Eye size={15} />
                        </Link>
                        <button onClick={() => setShowAssign(lead.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                          <UserCheck size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && data?.data?.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No leads found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.meta && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {((page-1)*20)+1}–{Math.min(page*20, data.meta.total)} of {data.meta.total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3">Prev</button>
                <button onClick={() => setPage(p => p+1)} disabled={page >= data.meta.totalPages} className="btn-secondary text-sm py-1.5 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-4">Assign to Agent</h3>
            <div className="space-y-2">
              {(agents || []).map((a: any) => (
                <button key={a.id}
                  onClick={() => assignMutation.mutate({ leadId: showAssign, agentId: a.id })}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-brand-50 hover:border-brand-300 transition-colors">
                  <p className="font-medium text-gray-900">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAssign(null)} className="btn-secondary w-full mt-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreate && <CreateLeadModal onClose={() => setShowCreate(false)} agents={agents || []} />}
    </div>
  );
}

function CreateLeadModal({ onClose, agents }: { onClose: () => void; agents: any[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ studentName: '', studentPhone: '', studentEmail: '', city: '', state: '', source: 'WEBSITE', agentId: '', notes: '' });
  const mutation = useMutation({
    mutationFn: () => leadsApi.create(form),
    onSuccess: () => { toast.success('Lead created!'); qc.invalidateQueries({ queryKey: ['leads'] }); onClose(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create lead'),
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="font-semibold text-gray-900 mb-5">Create New Lead</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Student Name *</label><input className="input" value={form.studentName} onChange={e => set('studentName', e.target.value)} /></div>
          <div><label className="label">Phone *</label><input className="input" value={form.studentPhone} onChange={e => set('studentPhone', e.target.value)} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.studentEmail} onChange={e => set('studentEmail', e.target.value)} /></div>
          <div><label className="label">City</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
          <div><label className="label">State</label><input className="input" value={form.state} onChange={e => set('state', e.target.value)} /></div>
          <div><label className="label">Source</label>
            <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Assign Agent</label>
            <select className="input" value={form.agentId} onChange={e => set('agentId', e.target.value)}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label className="label">Notes</label><textarea className="input h-20 resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.studentName || !form.studentPhone} className="btn-primary flex-1">
            {mutation.isPending ? 'Creating…' : 'Create Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
