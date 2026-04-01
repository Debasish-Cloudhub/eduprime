'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sulekhaApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function SulekhaPage() {
  const qc = useQueryClient();
  const { data: logs } = useQuery({ queryKey: ['sulekha-logs'], queryFn: () => sulekhaApi.getLogs().then(r => r.data) });

  const syncMutation = useMutation({
    mutationFn: () => sulekhaApi.sync().then(r => r.data),
    onSuccess: (d) => { toast.success(`Sync complete — ${d.leadsCreated} new leads`); qc.invalidateQueries({ queryKey: ['sulekha-logs'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Sync failed'),
  });

  const statusIcon = (s: string) => {
    if (s === 'SUCCESS' || s === 'PARTIAL') return <CheckCircle size={16} className="text-green-600"/>;
    if (s === 'FAILED') return <XCircle size={16} className="text-red-500"/>;
    return <Clock size={16} className="text-amber-500"/>;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Sulekha Integration" />
      <div className="flex-1 p-6 max-w-3xl">
        <div className="card mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Sulekha Lead Sync</h3>
            <p className="text-sm text-gray-500 mt-1">Automatically runs daily at 6:00 AM. Click to run manually.</p>
          </div>
          <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="btn-primary flex items-center gap-2">
            <RefreshCw size={16} className={syncMutation.isPending ? 'animate-spin' : ''}/>
            {syncMutation.isPending ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>

        {syncMutation.data && (
          <div className="card mb-6 bg-green-50 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">Last Sync Result</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center"><p className="text-green-600 text-xs">Found</p><p className="font-bold text-2xl text-green-900">{syncMutation.data.leadsFound}</p></div>
              <div className="text-center"><p className="text-green-600 text-xs">Created</p><p className="font-bold text-2xl text-green-900">{syncMutation.data.leadsCreated}</p></div>
              <div className="text-center"><p className="text-green-600 text-xs">Duplicates</p><p className="font-bold text-2xl text-green-900">{syncMutation.data.leadsDuplicate}</p></div>
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Sync History</h3>
          <div className="space-y-3">
            {logs?.data?.map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                {statusIcon(log.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{log.status}</span>
                    <span className="badge badge-gray text-xs">{log.triggeredBy}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(log.startedAt), 'dd MMM yyyy, HH:mm')}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{log.leadsFound} found · {log.leadsCreated} new</p>
                  <p className="text-gray-400">{log.leadsDuplicate} duplicates</p>
                </div>
              </div>
            ))}
            {!logs?.data?.length && <p className="text-sm text-gray-400 text-center py-4">No sync logs yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
