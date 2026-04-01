'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { excelApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

export default function ExcelUploadPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: history } = useQuery({ queryKey: ['excel-history'], queryFn: () => excelApi.getHistory().then(r => r.data) });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => excelApi.upload(file).then(r => r.data),
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Processed ${data.rowsProcessed} rows — ${data.rowsCreated} created, ${data.rowsUpdated} updated`);
      qc.invalidateQueries({ queryKey: ['excel-history'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Upload failed'),
  });

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Only .xlsx / .xls files accepted');
      return;
    }
    setResult(null);
    uploadMutation.mutate(file);
  };

  const downloadTemplate = async () => {
    const res = await excelApi.downloadTemplate();
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url; a.download = 'eduprime_courses_template.xlsx'; a.click();
  };

  const statusIcon = (status: string) => {
    if (status === 'SUCCESS') return <CheckCircle size={16} className="text-green-600"/>;
    if (status === 'FAILED') return <XCircle size={16} className="text-red-500"/>;
    return <AlertCircle size={16} className="text-amber-500"/>;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Excel Upload" />
      <div className="flex-1 p-6 max-w-4xl">

        {/* Download Template */}
        <div className="card mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Download Template</h3>
            <p className="text-sm text-gray-500 mt-1">Use this template to prepare your college & course data</p>
          </div>
          <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2">
            <Download size={16}/> Download Template
          </button>
        </div>

        {/* Upload Zone */}
        <div
          className={`card border-2 border-dashed mb-6 flex flex-col items-center justify-center min-h-48 cursor-pointer transition-colors
            ${dragging ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-300'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleFile(f); }} />
          {uploadMutation.isPending ? (
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-3"/>
              <p className="text-gray-600 font-medium">Processing…</p>
            </div>
          ) : (
            <div className="text-center">
              <FileSpreadsheet size={40} className="mx-auto mb-3 text-gray-300"/>
              <p className="font-medium text-gray-700">Drop Excel file here or click to browse</p>
              <p className="text-sm text-gray-400 mt-1">.xlsx or .xls — max 10 MB</p>
            </div>
          )}
        </div>

        {/* Upload Result */}
        {result && (
          <div className={`card mb-6 border-l-4 ${result.status === 'SUCCESS' ? 'border-green-500' : 'border-amber-500'}`}>
            <div className="flex items-center gap-2 mb-3">
              {statusIcon(result.status)}
              <h3 className="font-semibold">Upload Result</h3>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center bg-gray-50 rounded-lg p-3"><p className="text-gray-500 text-xs">Processed</p><p className="font-bold text-xl text-gray-900">{result.rowsProcessed}</p></div>
              <div className="text-center bg-green-50 rounded-lg p-3"><p className="text-green-600 text-xs">Created</p><p className="font-bold text-xl text-green-700">{result.rowsCreated}</p></div>
              <div className="text-center bg-blue-50 rounded-lg p-3"><p className="text-blue-600 text-xs">Updated</p><p className="font-bold text-xl text-blue-700">{result.rowsUpdated}</p></div>
              <div className="text-center bg-red-50 rounded-lg p-3"><p className="text-red-500 text-xs">Failed</p><p className="font-bold text-xl text-red-600">{result.rowsFailed}</p></div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-4 bg-red-50 rounded-lg p-3 text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((e: any, i: number) => <p key={i}>Row {e.row}: {e.error}</p>)}
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Upload History</h3>
          <div className="space-y-3">
            {history?.data?.map((h: any) => (
              <div key={h.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                {statusIcon(h.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{h.filename}</p>
                  <p className="text-xs text-gray-400">{format(new Date(h.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{h.rowsProcessed} rows · {h.rowsCreated} new · {h.rowsUpdated} updated</p>
                  {h.rowsFailed > 0 && <p className="text-red-500">{h.rowsFailed} failed</p>}
                </div>
              </div>
            ))}
            {!history?.data?.length && <p className="text-sm text-gray-400 text-center py-4">No uploads yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
