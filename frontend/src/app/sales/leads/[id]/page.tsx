'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, coursesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { ArrowLeft, Lock, IndianRupee, MessageSquare, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const TRANSITIONS: Record<string, string[]> = {
  NEW: ['INITIATED','LOST'], INITIATED: ['IN_PROGRESS','LOST'], IN_PROGRESS: ['DOCS_SUBMITTED','LOST'],
  DOCS_SUBMITTED: ['OFFER_RECEIVED','LOST'], OFFER_RECEIVED: ['ENROLLED','LOST'], ENROLLED: ['WON','LOST'], WON: [], LOST: [],
};

export default function SalesLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [showCourse, setShowCourse] = useState(false);

  const { data: lead, isLoading } = useQuery({ queryKey: ['lead', id], queryFn: () => leadsApi.getOne(id).then(r => r.data) });
  const { data: activities } = useQuery({ queryKey: ['lead-activities', id], queryFn: () => leadsApi.getActivities(id).then(r => r.data) });
  const { data: incentivePreview } = useQuery({
    queryKey: ['incentive-preview', id],
    queryFn: () => leadsApi.incentivePreview(id).then(r => r.data),
    enabled: !!lead?.courseId,
  });

  const transitionMutation = useMutation({
    mutationFn: (dto: any) => leadsApi.transition(id, dto),
    onSuccess: () => { toast.success('Status updated!'); qc.invalidateQueries({ queryKey: ['lead', id] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Transition failed'),
  });

  const noteMutation = useMutation({
    mutationFn: () => leadsApi.addNote(id, note),
    onSuccess: () => { toast.success('Note added'); setNote(''); qc.invalidateQueries({ queryKey: ['lead-activities', id] }); },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full"/></div>;
  if (!lead) return null;

  const nextStatuses = TRANSITIONS[lead.status] || [];
  const fmt = (n: number) => `₹${n?.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Lead Detail" />
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/sales/leads" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={18}/></Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{lead.studentName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={lead.status}/>
                <StatusBadge status={lead.slaStatus}/>
                <span className="text-sm text-gray-400">{lead.source}</span>
              </div>
            </div>
          </div>
          {/* Transition buttons */}
          <div className="flex gap-2">
            {nextStatuses.map(s => (
              <button key={s}
                onClick={() => transitionMutation.mutate({ status: s })}
                disabled={transitionMutation.isPending}
                className={s === 'LOST' ? 'btn-danger text-sm' : 'btn-primary text-sm'}>
                → {s.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Info */}
          <div className="col-span-2 space-y-5">
            {/* Contact Info */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Phone', lead.studentPhone], ['Email', lead.studentEmail || '—'],
                  ['City', lead.city || '—'], ['State', lead.state || '—'],
                  ['Qualification', lead.qualification || '—'], ['Priority', ['','Low','Medium','High'][lead.priority] || '—'],
                  ['Agent', lead.agent?.name || 'Unassigned'], ['Created', format(new Date(lead.createdAt), 'dd MMM yyyy')],
                ].map(([k, v]) => (
                  <div key={k}><p className="text-gray-400 text-xs">{k}</p><p className="font-medium text-gray-800 mt-0.5">{v}</p></div>
                ))}
              </div>
            </div>

            {/* College / Course */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">College & Course</h3>
                <button onClick={() => setShowCourse(true)} className="text-sm text-brand-600 hover:underline">Change</button>
              </div>
              {lead.college ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400 text-xs">College</p><p className="font-medium">{lead.college.name}</p></div>
                  <div><p className="text-gray-400 text-xs">Course</p><p className="font-medium">{lead.course?.name || '—'}</p></div>
                  <div><p className="text-gray-400 text-xs">Annual Fees</p><p className="font-medium text-brand-700">{lead.course?.fees ? fmt(Number(lead.course.fees)) : '—'}</p></div>
                  <div><p className="text-gray-400 text-xs">Location</p><p className="font-medium">{lead.college.city}, {lead.college.country}</p></div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No college/course selected yet.</p>
              )}
            </div>

            {/* Incentive */}
            {lead.status === 'WON' && lead.incentiveAmount ? (
              <div className="card border-2 border-green-200 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={16} className="text-green-700"/>
                  <h3 className="font-semibold text-green-800">Incentive Locked</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-green-600 text-xs">Fees at Closure</p><p className="font-bold text-green-900">{fmt(Number(lead.feesAtClosure))}</p></div>
                  <div><p className="text-green-600 text-xs">Incentive Amount</p><p className="font-bold text-green-900 text-lg">{fmt(Number(lead.incentiveAmount))}</p></div>
                  <div><p className="text-green-600 text-xs">Source</p><p className="font-medium text-green-800">{lead.incentiveSource?.replace('_',' ')}</p></div>
                </div>
              </div>
            ) : incentivePreview ? (
              <div className="card border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee size={16} className="text-blue-700"/>
                  <h3 className="font-semibold text-blue-800">Incentive Preview</h3>
                  <span className="badge badge-blue ml-auto">Not locked</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-blue-600 text-xs">Course Fees</p><p className="font-bold text-blue-900">{fmt(incentivePreview.fees)}</p></div>
                  <div><p className="text-blue-600 text-xs">Est. Incentive</p><p className="font-bold text-blue-900 text-lg">{fmt(incentivePreview.incentiveAmount)}</p></div>
                  <div><p className="text-blue-600 text-xs">Basis</p><p className="font-medium text-blue-800">{incentivePreview.incentiveSource?.replace('_',' ')}{incentivePreview.incentivePctUsed ? ` (${incentivePreview.incentivePctUsed}%)` : ''}</p></div>
                </div>
              </div>
            ) : null}

            {/* Notes */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Add Note</h3>
              <textarea className="input h-24 resize-none mb-3" placeholder="Write a note…" value={note} onChange={e => setNote(e.target.value)} />
              <button onClick={() => noteMutation.mutate()} disabled={!note.trim() || noteMutation.isPending} className="btn-primary">
                <MessageSquare size={15} className="inline mr-2"/>Add Note
              </button>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="card h-fit">
            <h3 className="font-semibold text-gray-800 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {(activities || []).map((a: any, i: number) => (
                <div key={a.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0"/>
                    {i < (activities?.length || 0) - 1 && <div className="w-px flex-1 bg-gray-200 mt-1"/>}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-xs font-semibold text-gray-700">{a.action.replace(/_/g,' ')}</p>
                    {a.note && <p className="text-xs text-gray-500 mt-0.5">{a.note}</p>}
                    {a.fromValue && <p className="text-xs text-gray-400 mt-0.5">{a.fromValue} → {a.toValue}</p>}
                    <p className="text-xs text-gray-300 mt-1">{format(new Date(a.createdAt), 'dd MMM HH:mm')}</p>
                  </div>
                </div>
              ))}
              {(!activities || activities.length === 0) && <p className="text-sm text-gray-400">No activity yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
