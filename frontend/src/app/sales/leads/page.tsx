'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, coursesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { Eye, ArrowRight, IndianRupee, Plus, Download, FileSpreadsheet, FileText, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { exportToExcel, exportToPDF } from '@/lib/export';

const NEXT_STATUS: Record<string, string> = {
  NEW: 'INITIATED', INITIATED: 'IN_PROGRESS', IN_PROGRESS: 'DOCS_SUBMITTED',
  DOCS_SUBMITTED: 'OFFER_RECEIVED', OFFER_RECEIVED: 'ENROLLED', ENROLLED: 'WON',
};
const SOURCES = ['SULEKHA','WEBSITE','REFERRAL','WALK_IN','SOCIAL_MEDIA','OTHER'];
const STATUSES = ['', 'NEW', 'INITIATED', 'IN_PROGRESS', 'DOCS_SUBMITTED', 'OFFER_RECEIVED', 'ENROLLED', 'WON', 'LOST'];

const emptyForm = { studentName: '', studentPhone: '', studentEmail: '', city: '', state: '', source: 'WALK_IN', courseId: '', collegeId: '', notes: '' };

export default function SalesLeadsPage() {
  const qc = useQueryClient();
  const [status, setStatus]     = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [showAdd, setShowAdd]   = useState(false);
  const [deleteId, setDeleteId]  = useState<string|null>(null);
  const [form, setForm]         = useState(emptyForm);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data, isLoading } = useQuery({
    queryKey: ['my-leads', status, search, page],
    queryFn: () => leadsApi.getAll({ status: status || undefined, search: search || undefined, page, limit: 20 }).then(r => r.data),
  });

  const { data: allData } = useQuery({
    queryKey: ['my-leads-all'],
    queryFn: () => leadsApi.getAll({ limit: 500 }).then(r => r.data),
  });

  const { data: colleges } = useQuery({ queryKey: ['colleges-dd'], queryFn: () => coursesApi.getColleges({ limit: 200 }).then(r => r.data) });
  const { data: courses  } = useQuery({
    queryKey: ['courses-dd', form.collegeId],
    queryFn: () => coursesApi.getCourses({ collegeId: form.collegeId || undefined, limit: 200 }).then(r => r.data),
    enabled: true,
  });

  const createLead = useMutation({
    mutationFn: () => leadsApi.create({ ...form, courseId: form.courseId || undefined, collegeId: form.collegeId || undefined }),
    onSuccess: () => {
      toast.success('Lead logged successfully!');
      qc.invalidateQueries({ queryKey: ['my-leads'] });
      qc.invalidateQueries({ queryKey: ['my-leads-all'] });
      setShowAdd(false);
      setForm(emptyForm);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create lead'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['my-leads'] }); toast.success('Lead deleted'); setDeleteId(null); },
    onError: (e:any) => toast.error(e?.response?.data?.message || 'Delete failed'),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, toStatus }: any) => leadsApi.transition(id, { status: toStatus }),
    onSuccess: (_, v) => { toast.success(`Moved to ${v.toStatus.replace(/_/g, ' ')}`); qc.invalidateQueries({ queryKey: ['my-leads'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const leads: any[] = data?.data || [];
  const allLeads: any[] = allData?.data || [];

  const doExcelExport = () => {
    const rows = allLeads.map(l => ({
      'Student Name':  l.studentName,
      'Phone':         l.studentPhone || '',
      'Email':         l.studentEmail || '',
      'City':          l.city || '',
      'State':         l.state || '',
      'Source':        l.source || '',
      'College':       l.college?.name || '',
      'Course':        l.course?.name || '',
      'Status':        l.status,
      'SLA Status':    l.slaStatus || '',
      'Incentive':     l.incentiveAmount ? `₹${Number(l.incentiveAmount).toLocaleString()}` : '',
      'Created':       l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : '',
    }));
    exportToExcel(rows, `My_Leads_${new Date().toISOString().slice(0,10)}`, 'Leads');
    toast.success('Excel downloaded!');
  };

  const doPDFExport = async () => {
    const cols = ['Student','Phone','City','College','Course','Status','Incentive','Date'];
    const rows = allLeads.map(l => [
      l.studentName, l.studentPhone||'', l.city||'',
      l.college?.name||'', l.course?.name||'',
      l.status, l.incentiveAmount ? `₹${Number(l.incentiveAmount).toLocaleString()}` : '—',
      l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : '',
    ]);
    await exportToPDF(cols, rows, 'My Leads Report — ISCC Digital', `My_Leads_${new Date().toISOString().slice(0,10)}`);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Leads" subtitle={`${data?.meta?.total ?? 0} total leads`} />
      <div className="flex-1 p-6">

        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Log New Lead
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={doExcelExport}
              className="flex items-center gap-2 px-3 py-2 border border-green-200 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button onClick={doPDFExport}
              className="flex items-center gap-2 px-3 py-2 border border-red-200 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100">
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input className="input max-w-xs" placeholder="Search name/phone…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${status === s ? 'bg-blue-700 text-white border-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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
                {['Student','Phone','City','College / Course','Status','SLA','Incentive','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No leads found. Click "Log New Lead" to add one.</td></tr>
              ) : leads.map((lead: any) => (
                <tr key={lead.id} className="table-row">
                  <td className="px-4 py-3 font-semibold text-gray-900">{lead.studentName}</td>
                  <td className="px-4 py-3 text-gray-500">{lead.studentPhone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{lead.city || '—'}</td>
                  <td className="px-4 py-3">
                    {lead.college || lead.course ? (
                      <div>
                        <p className="text-xs font-medium text-gray-800 truncate max-w-36">{lead.college?.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-36">{lead.course?.name}</p>
                      </div>
                    ) : <span className="text-xs text-gray-300">Not set</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={lead.slaStatus} /></td>
                  <td className="px-4 py-3">
                    {lead.incentiveAmount ? (
                      <span className="flex items-center gap-0.5 text-green-700 font-semibold text-xs">
                        <IndianRupee size={11} />{Number(lead.incentiveAmount).toLocaleString('en-IN')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/sales/leads/${lead.id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye size={14} /></Link>
                      <button onClick={() => setDeleteId(lead.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600" title="Delete lead">
                        <Trash2 size={14}/>
                      </button>
                      {NEXT_STATUS[lead.status] && (
                        <button
                          onClick={() => transitionMutation.mutate({ id: lead.id, toStatus: NEXT_STATUS[lead.status] })}
                          className="flex items-center gap-0.5 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100"
                        >
                          <ArrowRight size={12} />{NEXT_STATUS[lead.status].replace(/_/g, ' ')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.meta && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">{data.meta.total} leads · Page {data.meta.page} of {data.meta.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary text-sm py-1 px-3">Prev</button>
                <button onClick={() => setPage(p => p+1)} disabled={page >= data.meta.totalPages} className="btn-secondary text-sm py-1 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Log New Lead</h3>
              <button onClick={() => { setShowAdd(false); setForm(emptyForm); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Student Name *</label>
                <input className="input" placeholder="Full name" value={form.studentName} onChange={e => set('studentName', e.target.value)} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input" placeholder="+91 XXXXX XXXXX" value={form.studentPhone} onChange={e => set('studentPhone', e.target.value)} />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="student@email.com" value={form.studentEmail} onChange={e => set('studentEmail', e.target.value)} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input" placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">Lead Source *</label>
                <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
                  {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">College (optional)</label>
                <select className="input" value={form.collegeId} onChange={e => set('collegeId', e.target.value)}>
                  <option value="">Select college...</option>
                  {(colleges?.data || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Course (optional)</label>
                <select className="input" value={form.courseId} onChange={e => set('courseId', e.target.value)}>
                  <option value="">Select course...</option>
                  {(courses?.data || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Notes</label>
                <textarea className="input" rows={3} placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => { setShowAdd(false); setForm(emptyForm); }} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => { if (!form.studentName) { toast.error('Student name is required'); return; } createLead.mutate(); }}
                disabled={createLead.isPending}
                className="flex-1 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50">
                {createLead.isPending ? 'Saving...' : 'Log Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lead Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">Delete Lead?</h3>
            <p className="text-gray-500 text-sm mb-5">This will permanently delete the lead and all associated notes. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId!)} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}