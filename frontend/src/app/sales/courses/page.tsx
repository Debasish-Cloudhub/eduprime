'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi, incentivesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { Search, MapPin, Clock, IndianRupee, GraduationCap, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function SalesCoursesPage() {
  const [search, setSearch] = useState('');
  const [stream, setStream] = useState('');
  const [page, setPage] = useState(1);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data: streams } = useQuery({ queryKey: ['streams'], queryFn: () => coursesApi.getStreams().then(r => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['courses', search, stream, page],
    queryFn: () => coursesApi.getCourses({ search: search || undefined, stream: stream || undefined, page, limit: 12 }).then(r => r.data),
  });

  const { data: preview } = useQuery({
    queryKey: ['incentive-preview', previewId],
    queryFn: () => previewId ? incentivesApi.preview(previewId).then(r => r.data) : null,
    enabled: !!previewId,
  });

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Course Catalogue" />
      <div className="flex-1 p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="input pl-9" placeholder="Search courses, colleges…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <select className="input w-44" value={stream} onChange={e => { setStream(e.target.value); setPage(1); }}>
            <option value="">All Streams</option>
            {(streams || []).map((s: string) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-5">{Array(6).fill(0).map((_,i) => <div key={i} className="card animate-pulse h-48"/>)}</div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{data?.meta?.total || 0} courses</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(data?.data || []).map((course: any) => (
                <div key={course.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={20} className="text-brand-600"/>
                    </div>
                    {course.stream && <span className="badge badge-blue">{course.stream}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{course.name}</h3>
                  <p className="text-sm text-brand-700 font-medium mb-3">{course.college?.name}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><MapPin size={11}/>{course.college?.city}, {course.college?.country}</div>
                    {course.duration && <div className="flex items-center gap-1"><Clock size={11}/>{course.duration}</div>}
                    <div className="flex items-center gap-1 font-semibold text-sm text-gray-800 mt-1">
                      <IndianRupee size={12}/>{fmt(Number(course.fees))}/yr
                    </div>
                  </div>
                  {/* Incentive preview */}
                  {previewId === course.id && preview ? (
                    <div className="mt-3 pt-3 border-t border-green-100 bg-green-50 rounded-lg p-2">
                      <div className="flex items-center gap-1 text-green-700 text-xs font-semibold mb-1"><Lock size={11}/> Incentive</div>
                      <p className="text-lg font-bold text-green-800">{fmt(preview.incentiveAmount)}</p>
                      <p className="text-xs text-green-600">{preview.incentiveSource?.replace('_',' ')} {preview.incentivePctUsed ? `(${preview.incentivePctUsed}%)` : ''}</p>
                    </div>
                  ) : (
                    <button onClick={() => setPreviewId(course.id)} className="mt-3 w-full text-xs text-brand-600 border border-brand-200 rounded-lg py-1.5 hover:bg-brand-50 flex items-center justify-center gap-1">
                      <Lock size={11}/> Preview Incentive
                    </button>
                  )}
                </div>
              ))}
            </div>
            {data?.meta?.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-secondary">← Prev</button>
                <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {data.meta.totalPages}</span>
                <button onClick={() => setPage(p => p+1)} disabled={page>=data.meta.totalPages} className="btn-secondary">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
