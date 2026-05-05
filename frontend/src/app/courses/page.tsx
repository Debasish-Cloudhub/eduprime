'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, Clock, BookOpen, Globe, ChevronRight, X, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iscc-backend-production.up.railway.app/api/v1';
const CURRENCY_SYMBOLS: Record<string, string> = { INR:'₹', USD:'$', EUR:'€', AUD:'A$', CNY:'¥', SGD:'S$' };

interface Course {
  id: string; name: string; stream: string|null; degree: string|null;
  duration: string|null; fees: number; currencyType: string;
  country: string|null; eligibility: string|null;
  college: { id: string; name: string; city: string|null; country: string };
}
interface Meta { total: number; page: number; totalPages: number; limit: number; }

export default function CoursesPage() {
  const [courses, setCourses]   = useState<Course[]>([]);
  const [meta, setMeta]         = useState<Meta|null>(null);
  const [streams, setStreams]    = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [stream, setStream]     = useState('');
  const [country, setCountry]   = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState<Course|null>(null);

  // Check URL for ?id= on mount
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
      fetch(`${API_URL}/public/courses?limit=100`)
        .then(r => r.json())
        .then(d => { const c = d?.data?.find((x: Course) => x.id === id); if (c) setSelected(c); });
    }
  }, []);

  // Fetch streams
  useEffect(() => {
    fetch(`${API_URL}/public/courses?limit=100`)
      .then(r => r.json())
      .then(d => {
        const s = Array.from(new Set<string>((d?.data || []).map((c: Course) => c.stream).filter(Boolean) as string[])).sort();
        setStreams(s);
      });
  }, []);

  // Fetch courses with filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (search)  params.set('search',  search);
    if (stream)  params.set('stream',  stream);
    if (country) params.set('country', country);
    fetch(`${API_URL}/public/courses?${params}`)
      .then(r => r.json())
      .then(d => { setCourses(d?.data || []); setMeta(d?.meta || null); })
      .finally(() => setLoading(false));
  }, [search, stream, country, page]);

  const resetFilters = () => { setSearch(''); setStream(''); setCountry(''); setPage(1); };
  const hasFilters = search || stream || country;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-blue-700 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <span className="text-gray-300">|</span>
            <span className="font-bold text-gray-900">All Courses</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login"    className="px-4 py-2 text-sm font-semibold text-blue-900 border border-blue-900 rounded-xl hover:bg-blue-50 transition-colors">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all">Register Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Explore All Courses</h1>
          <p className="text-gray-500">{meta?.total ?? '—'} courses from {' '}
            <Link href="/colleges" className="text-blue-700 hover:underline font-medium">partner colleges</Link> across India and abroad
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses, colleges, streams…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <select value={stream} onChange={e => { setStream(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none min-w-[160px]">
            <option value="">All Streams</option>
            {streams.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={country} onChange={e => { setCountry(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none min-w-[160px]">
            <option value="">All Countries</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Singapore">Singapore</option>
          </select>
          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl hover:border-red-200 transition-colors">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-100 rounded mb-4 w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No courses found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            {hasFilters && <button onClick={resetFilters} className="mt-4 text-blue-700 text-sm hover:underline">Clear filters</button>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const symbol = CURRENCY_SYMBOLS[course.currencyType] || '₹';
              const location = course.country || course.college?.country;
              return (
                <button key={course.id} onClick={() => setSelected(course)}
                  className="text-left bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700" />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md bg-blue-700">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2 flex-1">{course.name}</h3>
                    {course.stream && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium flex-shrink-0">{course.stream}</span>
                    )}
                  </div>
                  <p className="text-blue-600 text-sm mb-3 line-clamp-1">{course.college?.name}</p>
                  {location && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <Globe className="w-3 h-3 flex-shrink-0" />{location}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>}
                    {course.degree  && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.degree}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    {course.fees > 0
                      ? <span className="font-bold text-gray-800">{symbol}{Number(course.fees).toLocaleString()}<span className="text-xs text-gray-400 font-normal">/yr</span></span>
                      : <span className="text-xs text-gray-400">Fees on request</span>}
                    <span className="text-blue-700 text-xs font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
            <span className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page >= meta.totalPages}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <div className="h-2 bg-blue-700 rounded-t-2xl" />
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center flex-shrink-0 shadow-md">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selected.name}</h2>
                  <Link href={`/colleges?id=${selected.college?.id}`} className="text-blue-700 text-sm hover:underline font-medium" onClick={() => setSelected(null)}>
                    {selected.college?.name}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Stream',      value: selected.stream      },
                  { label: 'Degree',      value: selected.degree      },
                  { label: 'Duration',    value: selected.duration    },
                  { label: 'Eligibility', value: selected.eligibility },
                  { label: 'Annual Fees', value: selected.fees > 0 ? `${CURRENCY_SYMBOLS[selected.currencyType]||'₹'}${Number(selected.fees).toLocaleString()} (${selected.currencyType})` : 'On request' },
                  { label: 'Country',     value: selected.country || selected.college?.country },
                  { label: 'College City',value: selected.college?.city },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                    <div className="font-semibold text-gray-800 text-sm">{value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <a href="/#contact" onClick={() => setSelected(null)}
                  className="flex-1 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all text-sm text-center">
                  Book Free Counselling
                </a>
                <button onClick={() => setSelected(null)}
                  className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
