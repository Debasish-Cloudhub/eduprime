'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api';
import Topbar from '@/components/ui/Topbar';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, BookOpen, Building2 } from 'lucide-react';

// ── COURSES LIST PAGE ─────────────────────────────────────────────────────────
export default function CoursesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'courses' | 'colleges'>('courses');
  const [search, setSearch] = useState('');
  const [stream, setStream] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'course' | 'college'>('course');

  const { data: streams } = useQuery({ queryKey: ['streams'], queryFn: () => coursesApi.getStreams().then(r => r.data) });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses', search, stream, page],
    queryFn: () => coursesApi.getCourses({ search: search || undefined, stream: stream || undefined, page, limit: 20 }).then(r => r.data),
  });

  const { data: colleges, isLoading: collegesLoading } = useQuery({
    queryKey: ['admin-colleges', search, page],
    queryFn: () => coursesApi.getColleges({ search: search || undefined, page, limit: 20 }).then(r => r.data),
  });

  const deleteCourse = useMutation({
    mutationFn: (id: string) => coursesApi.deleteCourse(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-courses'] }); setDeleteTarget(null); toast.success('Course deleted'); },
    onError: () => toast.error('Failed to delete course'),
  });

  const deleteCollege = useMutation({
    mutationFn: (id: string) => coursesApi.updateCourse(id, { isActive: false }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-colleges'] }); setDeleteTarget(null); toast.success('College deleted'); },
    onError: () => toast.error('Failed to delete college'),
  });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteType === 'course') deleteCourse.mutate(deleteTarget.id);
    else deleteCollege.mutate(deleteTarget.id);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Courses & Colleges" />
      <div className="flex-1 overflow-auto p-6">
        {/* Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setTab('courses')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'courses' ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <BookOpen className="w-4 h-4" /> Courses
          </button>
          <button onClick={() => setTab('colleges')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'colleges' ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <Building2 className="w-4 h-4" /> Colleges
          </button>
        </div>

        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={`Search ${tab}...`}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          {tab === 'courses' && (
            <select value={stream} onChange={e => setStream(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none">
              <option value="">All Streams</option>
              {(streams || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {tab === 'courses' && (
            <button onClick={() => { setShowCreate(true); setEditing(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">
              <Plus className="w-4 h-4" /> Add Course
            </button>
          )}
        </div>

        {/* Courses Table */}
        {tab === 'courses' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Course', 'College', 'Stream', 'Degree', 'Annual Fees', 'Incentive', 'Seats', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coursesLoading ? (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
                  ) : !courses?.data?.length ? (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">No courses found. Upload an Excel file to seed data.</td></tr>
                  ) : courses.data.map((c: any) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">{c.name}</td>
                      <td className="py-3 px-4 text-blue-600 max-w-xs truncate">{c.college?.name || '—'}</td>
                      <td className="py-3 px-4">
                        {c.stream ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{c.stream}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{c.degree || '—'}</td>
                      <td className="py-3 px-4 font-medium">₹{Number(c.fees || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {c.incentiveFixed ? <span className="text-green-600 font-medium">₹{Number(c.incentiveFixed).toLocaleString()}</span> :
                         c.incentivePct ? <span className="text-blue-600">{c.incentivePct}%</span> :
                         <span className="text-gray-300 text-xs">default</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{c.seats || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditing(c); setShowCreate(false); }}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setDeleteTarget(c); setDeleteType('course'); }}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {courses?.meta && courses.meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Page {courses.meta.page} of {courses.meta.totalPages} ({courses.meta.total} total)</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
                  <button onClick={() => setPage(p => p+1)} disabled={page >= courses.meta.totalPages} className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Colleges Table */}
        {tab === 'colleges' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['College', 'Location', 'Website', 'Courses', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {collegesLoading ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr>
                  ) : !colleges?.data?.length ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">No colleges found.</td></tr>
                  ) : colleges.data.map((c: any) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600">{[c.city, c.state, c.country].filter(Boolean).join(', ') || '—'}</td>
                      <td className="py-3 px-4 text-blue-600">{c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="hover:underline truncate block max-w-xs">{c.website}</a> : '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{c._count?.courses ?? 0}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => { setDeleteTarget(c); setDeleteType('college'); }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Course Create/Edit Modal */}
      {(showCreate || editing) && (
        <CourseModal
          course={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSave={() => { qc.invalidateQueries({ queryKey: ['admin-courses'] }); setShowCreate(false); setEditing(null); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete {deleteType === 'course' ? 'Course' : 'College'}</h3>
            <p className="text-gray-500 text-sm mb-2">Are you sure you want to delete</p>
            <p className="font-semibold text-gray-900 mb-6">"{deleteTarget.name}"?</p>
            <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} disabled={deleteCourse.isPending || deleteCollege.isPending}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50">
                {deleteCourse.isPending || deleteCollege.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── COURSE MODAL ───────────────────────────────────────────────────────────────
function CourseModal({ course, onClose, onSave }: { course: any; onClose: () => void; onSave: () => void }) {
  const { data: colleges } = useQuery({ queryKey: ['colleges-list'], queryFn: () => coursesApi.getColleges({ limit: 200 }).then(r => r.data) });
  const [form, setForm] = useState({
    name: course?.name || '',
    collegeId: course?.collegeId || '',
    stream: course?.stream || '',
    degree: course?.degree || '',
    duration: course?.duration || '',
    fees: course?.fees || '',
    totalFees: course?.totalFees || '',
    incentiveFixed: course?.incentiveFixed || '',
    incentivePct: course?.incentivePct || '',
    seats: course?.seats || '',
    eligibility: course?.eligibility || '',
  });

  const mutation = useMutation({
    mutationFn: () => course
      ? coursesApi.updateCourse(course.id, form)
      : coursesApi.createCourse(form),
    onSuccess: () => { toast.success(course ? 'Course updated!' : 'Course created!'); onSave(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Internal server error — check all required fields'),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-5 text-lg">{course ? 'Edit Course' : 'Add Course'}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Course Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. B.Tech Computer Science" />
          </div>
          <div className="col-span-2">
            <label className="label">College *</label>
            <select className="input" value={form.collegeId} onChange={e => set('collegeId', e.target.value)}>
              <option value="">Select college...</option>
              {colleges?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Stream</label><input className="input" value={form.stream} onChange={e => set('stream', e.target.value)} placeholder="e.g. Engineering" /></div>
          <div><label className="label">Degree</label><input className="input" value={form.degree} onChange={e => set('degree', e.target.value)} placeholder="e.g. B.Tech" /></div>
          <div><label className="label">Duration</label><input className="input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 4 years" /></div>
          <div><label className="label">Seats</label><input className="input" type="number" value={form.seats} onChange={e => set('seats', e.target.value)} /></div>
          <div><label className="label">Annual Fees (₹) *</label><input className="input" type="number" value={form.fees} onChange={e => set('fees', e.target.value)} placeholder="0" /></div>
          <div><label className="label">Total Fees (₹)</label><input className="input" type="number" value={form.totalFees} onChange={e => set('totalFees', e.target.value)} /></div>
          <div><label className="label">Incentive Fixed (₹)</label><input className="input" type="number" value={form.incentiveFixed} onChange={e => set('incentiveFixed', e.target.value)} placeholder="Overrides %" /></div>
          <div><label className="label">Incentive %</label><input className="input" type="number" value={form.incentivePct} onChange={e => set('incentivePct', e.target.value)} placeholder="e.g. 5" /></div>
          <div className="col-span-2"><label className="label">Eligibility</label><input className="input" value={form.eligibility} onChange={e => set('eligibility', e.target.value)} placeholder="e.g. Graduate" /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!form.name || !form.collegeId || mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending ? 'Saving...' : course ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
