'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api';
import { Search, MapPin, Clock, IndianRupee, GraduationCap } from 'lucide-react';

export default function StudentCoursesPage() {
  const [search, setSearch] = useState('');
  const [stream, setStream] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);

  const { data: streams } = useQuery({ queryKey: ['streams'], queryFn: () => coursesApi.getStreams().then(r => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['student-courses', search, stream, country, page],
    queryFn: () => coursesApi.getCourses({ search: search||undefined, stream: stream||undefined, country: country||undefined, page, limit: 12 }).then(r => r.data),
  });

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}/yr`;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Courses</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="input pl-9" placeholder="Search courses, colleges…" value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}/>
        </div>
        <select className="input w-44" value={stream} onChange={e => {setStream(e.target.value); setPage(1);}}>
          <option value="">All Streams</option>
          {(streams||[]).map((s: string) => <option key={s}>{s}</option>)}
        </select>
        <select className="input w-36" value={country} onChange={e => {setCountry(e.target.value); setPage(1);}}>
          <option value="">All Countries</option>
          <option>India</option>
          <option>Canada</option>
          <option>Australia</option>
          <option>UK</option>
          <option>USA</option>
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_,i) => (
            <div key={i} className="card animate-pulse"><div className="h-5 bg-gray-200 rounded mb-3 w-3/4"/><div className="h-3 bg-gray-100 rounded mb-2"/><div className="h-3 bg-gray-100 rounded w-1/2"/></div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{data?.meta?.total || 0} courses found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(data?.data || []).map((course: any) => (
              <div key={course.id} className="card hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={20} className="text-brand-600"/>
                  </div>
                  {course.stream && <span className="badge badge-blue">{course.stream}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                <p className="text-sm text-brand-700 font-medium mb-3">{course.college?.name}</p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5"><MapPin size={12}/>{course.college?.city}, {course.college?.country}</div>
                  {course.duration && <div className="flex items-center gap-1.5"><Clock size={12}/>{course.duration}</div>}
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-800 mt-2">
                    <IndianRupee size={13}/>{fmt(Number(course.fees))}
                  </div>
                </div>
                {course.eligibility && (
                  <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">Eligibility: {course.eligibility}</p>
                )}
                <button className="btn-primary w-full mt-4 text-sm py-2">Apply Now</button>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
  );
}
