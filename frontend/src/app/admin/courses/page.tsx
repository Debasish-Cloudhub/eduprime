'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import { Plus, Search, Edit2, BookOpen, Building2 } from 'lucide-react';

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'courses' | 'colleges'>('courses');
  const [search, setSearch] = useState('');
  const [stream, setStream] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: streams } = useQuery({ queryKey: ['streams'], queryFn: () => coursesApi.getStreams().then(r => r.data) });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses', search, stream, page],
    queryFn: () => coursesApi.getCourses({ search: search || undefined, stream: stream || undefined, page, limit: 20 }).then(r => r.data),
    enabled: tab === 'courses',
  });

  const { data: colleges, isLoading: collegesLoading } = useQuery({
    queryKey: ['admin-colleges', search, page],
    queryFn: () => coursesApi.getColleges({ search: search || undefined, page, limit: 20 }).then(r => r.data),
    enabled: tab === 'colleges',
  });

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Courses & Colleges" />
      <div className="flex-1 p-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ key: 'courses', icon: <BookOpen size={15}/>, label: 'Courses' }, { key: 'colleges', icon: <Building2 size={15}/>, label: 'Colleges' }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key as any); setPage(1); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${tab === t.key ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="input pl-9" placeholder={`Search ${tab}…`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          {tab === 'courses' && (
            <select className="input w-44" value={stream} onChange={e => { setStream(e.target.value); setPage(1); }}>
              <option value="">All Streams</option>
              {(streams || []).map((s: string) => <option key={s}>{s}</option>)}
            </select>
          )}
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 ml-auto">
            <Plus size={15}/> Add {tab === 'courses' ? 'Course' : 'College'}
          </button>
        </div>

        {/* Courses Table */}
        {tab === 'courses' && (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Course', 'College', 'Stream', 'Degree', 'Annual Fees', 'Incentive', 'Seats', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coursesLoading && <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading…</td></tr>}
                {courses?.data?.map((c: any) => (
                  <tr key={c.id} className="table-row">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-48 truncate">{c.name}</td>
                    <td className="px-4 py-3 text-brand-700 text-sm font-medium max-w-36 truncate">{c.college?.name}</td>
                    <td className="px-4 py-3"><span className="badge badge-blue">{c.stream || '—'}</span></td>
                    <td className="px-4 py-3 text-gray-600">{c.degree || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{fmt(Number(c.fees))}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      {c.incentiveFixed ? fmt(Number(c.incentiveFixed)) : c.incentivePct ? `${c.incentivePct}%` : <span className="text-gray-300">default</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.seats || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditing(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
                        <Edit2 size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
                {!coursesLoading && !courses?.data?.length && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No courses found. Upload an Excel file to seed data.</td></tr>
                )}
              </tbody>
            </table>
            {courses?.meta && (
              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-500">
                <span>{courses.meta.total} courses</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-secondary py-1 px-3">Prev</button>
                  <button onClick={() => setPage(p => p+1)} disabled={page>=courses.meta.totalPages} className="btn-secondary py-1 px-3">Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Colleges Table */}
        {tab === 'colleges' && (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['College', 'City', 'State', 'Country', 'Type', 'Ranking', 'Courses', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {collegesLoading && <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading…</td></tr>}
                {colleges?.data?.map((c: any) => (
                  <tr key={c.id} className="table-row">
                    <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.city || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.state || '—'}</td>
                    <td className="px-4 py-3"><span className={`badge ${c.country === 'India' ? 'badge-blue' : 'badge-success'}`}>{c.country}</span></td>
                    <td className="px-4 py-3 text-gray-500">{c.type || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{c.ranking ? `#${c.ranking}` : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-brand-700">{c._count?.courses || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
                {!collegesLoading && !colleges?.data?.length && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No colleges found.</td></tr>
                )}
              </tbody>
            </table>
            {colleges?.meta && (
              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-500">
                <span>{colleges.meta.total} colleges</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-secondary py-1 px-3">Prev</button>
                  <button onClick={() => setPage(p => p+1)} disabled={page>=colleges.meta.totalPages} className="btn-secondary py-1 px-3">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editing) && (
        <CourseFormModal
          course={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSave={() => { qc.invalidateQueries({ queryKey: ['admin-courses'] }); setShowCreate(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function CourseFormModal({ course, onClose, onSave }: { course?: any; onClose: () => void; onSave: () => void }) {
  const { data: colleges } = useQuery({ queryKey: ['colleges-list'], queryFn: () => coursesApi.getColleges({ limit: 100 }).then(r => r.data) });
  const [form, setForm] = useState({
    name: course?.name || '', collegeId: course?.collegeId || '', stream: course?.stream || '',
    degree: course?.degree || '', duration: course?.duration || '', fees: course?.fees || '',
    totalFees: course?.totalFees || '', incentiveFixed: course?.incentiveFixed || '',
    incentivePct: course?.incentivePct || '', seats: course?.seats || '', eligibility: course?.eligibility || '',
  });

  const mutation = useMutation({
    mutationFn: () => course ? coursesApi.updateCourse(course.id, form) : coursesApi.createCourse(form),
    onSuccess: () => { toast.success(course ? 'Course updated!' : 'Course created!'); onSave(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-5">{course ? 'Edit Course' : 'Add Course'}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Course Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)}/>
          </div>
          <div className="col-span-2">
            <label className="label">College *</label>
            <select className="input" value={form.collegeId} onChange={e => set('collegeId', e.target.value)}>
              <option value="">Select College…</option>
              {colleges?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Stream</label><input className="input" value={form.stream} onChange={e => set('stream', e.target.value)} placeholder="Engineering"/></div>
          <div><label className="label">Degree</label><input className="input" value={form.degree} onChange={e => set('degree', e.target.value)} placeholder="B.Tech"/></div>
          <div><label className="label">Duration</label><input className="input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="4 years"/></div>
          <div><label className="label">Seats</label><input className="input" type="number" value={form.seats} onChange={e => set('seats', e.target.value)}/></div>
          <div><label className="label">Annual Fees (₹) *</label><input className="input" type="number" value={form.fees} onChange={e => set('fees', e.target.value)}/></div>
          <div><label className="label">Total Fees (₹)</label><input className="input" type="number" value={form.totalFees} onChange={e => set('totalFees', e.target.value)}/></div>
          <div><label className="label">Incentive Fixed (₹)</label><input className="input" type="number" value={form.incentiveFixed} onChange={e => set('incentiveFixed', e.target.value)} placeholder="Overrides %"/></div>
          <div><label className="label">Incentive %</label><input className="input" type="number" value={form.incentivePct} onChange={e => set('incentivePct', e.target.value)} placeholder="e.g. 5"/></div>
          <div className="col-span-2"><label className="label">Eligibility</label><input className="input" value={form.eligibility} onChange={e => set('eligibility', e.target.value)}/></div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!form.name || !form.collegeId || !form.fees || mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending ? 'Saving…' : course ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
