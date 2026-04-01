'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, AlertTriangle } from 'lucide-react';

const COLUMNS = [
  { key: 'NEW',            label: 'New',            color: 'bg-gray-100 text-gray-700',    dot: 'bg-gray-400' },
  { key: 'INITIATED',      label: 'Initiated',      color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  { key: 'IN_PROGRESS',    label: 'In Progress',    color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  { key: 'DOCS_SUBMITTED', label: 'Docs Submitted', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  { key: 'OFFER_RECEIVED', label: 'Offer Received', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { key: 'ENROLLED',       label: 'Enrolled',       color: 'bg-cyan-100 text-cyan-700',    dot: 'bg-cyan-500' },
];

const NEXT: Record<string, string> = {
  NEW: 'INITIATED', INITIATED: 'IN_PROGRESS', IN_PROGRESS: 'DOCS_SUBMITTED',
  DOCS_SUBMITTED: 'OFFER_RECEIVED', OFFER_RECEIVED: 'ENROLLED', ENROLLED: 'WON',
};

export default function SalesBoardPage() {
  const qc = useQueryClient();
  const { data: board, isLoading } = useQuery({
    queryKey: ['board'],
    queryFn: () => leadsApi.getBoard().then(r => r.data),
    refetchInterval: 60_000,
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: any) => leadsApi.transition(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['board'] }); toast.success('Lead moved!'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Move failed'),
  });

  if (isLoading) return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Board View" />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Board View" />
      <div className="flex-1 p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {COLUMNS.map(col => {
            const leads = board?.[col.key] || [];
            return (
              <div key={col.key} className="w-72 flex-shrink-0">
                {/* Column Header */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 ${col.color}`}>
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="font-semibold text-sm">{col.label}</span>
                  <span className="ml-auto text-xs font-bold opacity-70">{leads.length}</span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {leads.map((lead: any) => (
                    <div key={lead.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                      {/* SLA indicator */}
                      {lead.slaStatus === 'BREACHED' && (
                        <div className="flex items-center gap-1 text-red-500 text-xs mb-2">
                          <AlertTriangle size={12} /> SLA Breached
                        </div>
                      )}
                      {lead.slaStatus === 'AT_RISK' && (
                        <div className="flex items-center gap-1 text-amber-500 text-xs mb-2">
                          <AlertTriangle size={12} /> At Risk
                        </div>
                      )}

                      <p className="font-semibold text-gray-900 text-sm">{lead.studentName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{lead.studentPhone}</p>

                      {lead.college && (
                        <div className="mt-2 pt-2 border-t border-gray-50">
                          <p className="text-xs font-medium text-brand-700 truncate">{lead.college.name}</p>
                          <p className="text-xs text-gray-400 truncate">{lead.course?.name}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <Link href={`/admin/leads/${lead.id}`}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 border border-gray-200 rounded px-2 py-1">
                          <Eye size={11} /> View
                        </Link>
                        {NEXT[col.key] && (
                          <button
                            onClick={() => moveMutation.mutate({ id: lead.id, status: NEXT[col.key] })}
                            className="flex-1 text-xs bg-brand-600 text-white rounded px-2 py-1 hover:bg-brand-700 truncate"
                          >
                            → {NEXT[col.key].replace('_', ' ')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {leads.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                      <p className="text-xs text-gray-300">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
