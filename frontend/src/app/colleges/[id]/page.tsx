'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Building2, Globe, MapPin, ExternalLink,
  BookOpen, Clock, GraduationCap, ChevronRight,
  Award, Users, Star, Search,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iscc-backend-production.up.railway.app/api/v1';
const CURRENCY_SYMBOLS: Record<string, string> = { INR:'₹', USD:'$', EUR:'€', AUD:'A$', CNY:'¥', SGD:'S$' };

interface College {
  id: string; name: string; city: string|null; state: string|null;
  country: string; type: string|null; ranking: number|null;
  website: string|null; currencyType: string;
  _count: { courses: number };
}
interface Course {
  id: string; name: string; stream: string|null; degree: string|null;
  duration: string|null; fees: number; currencyType: string;
  country: string|null; eligibility: string|null;
  college: { id: string; name: string; city: string|null; country: string };
}

function getTypeBadge(type: string|null, country: string) {
  if (!type) return country !== 'India'
    ? { label:'International', cls:'bg-purple-100 text-purple-700' }
    : { label:'Partner',       cls:'bg-blue-100   text-blue-700'   };
  const t = type.toLowerCase();
  if (t.includes('online'))     return { label:'Online',     cls:'bg-green-100  text-green-700'  };
  if (t.includes('distance'))   return { label:'Distance',   cls:'bg-blue-100   text-blue-700'   };
  if (t.includes('government')) return { label:'Government', cls:'bg-amber-100  text-amber-700'  };
  if (t.includes('private'))    return { label:'Private',    cls:'bg-indigo-100 text-indigo-700' };
  if (t.includes('deemed'))     return { label:'Deemed',     cls:'bg-teal-100   text-teal-700'   };
  return { label: type, cls: 'bg-gray-100 text-gray-600' };
}

export default function CollegeDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [college,  setCollege]  = useState<College|null>(null);
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cLoading, setCLoading] = useState(true);
  const [search,   setSearch]   = useState('');
  const [stream,   setStream]   = useState('');

  // Fetch college info
  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/public/colleges?limit=200`)
      .then(r => r.json())
      .then(d => {
        const found = (d?.data || []).find((c: College) => c.id === id);
        setCollege(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Fetch courses for this college
  useEffect(() => {
    if (!id) return;
    setCLoading(true);
    const params = new URLSearchParams({ collegeId: id, limit: '100' });
    if (stream) params.set('stream', stream);
    fetch(`${API_URL}/public/courses?${params}`)
      .then(r => r.json())
      .then(d => { setCourses(d?.data || []); setCLoading(false); })
      .catch(() => setCLoading(false));
  }, [id, stream]);

  const filtered = courses.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.stream || '').toLowerCase().includes(search.toLowerCase())
  );

  const streams = Array.from(new Set(courses.map(c => c.stream).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading college details…</p>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">College not found</h2>
          <Link href="/colleges" className="text-blue-700 hover:underline">← Back to Colleges</Link>
        </div>
      </div>
    );
  }

  const badge    = getTypeBadge(college.type, college.country);
  const location = [college.city, college.state, college.country !== 'India' ? college.country : null].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/colleges" className="flex items-center gap-1.5 text-gray-500 hover:text-blue-700 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> All Colleges
            </Link>
            <span className="text-gray-300">|</span>
            <span className="font-medium text-gray-700 text-sm truncate max-w-[200px] sm:max-w-none">{college.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login"    className="px-4 py-2 text-sm font-semibold text-blue-900 border border-blue-900 rounded-xl hover:bg-blue-50 transition-colors">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all">Register Free</Link>
          </div>
        </div>
      </nav>

      {/* College Hero Banner */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                {college.ranking && (
                  <span className="flex items-center gap-1 text-xs bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full font-medium">
                    <Star className="w-3 h-3" /> Ranked #{college.ranking}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">{college.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-blue-200 text-sm">
                {location && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{location}</span>
                )}
                {college.country && (
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{college.country}</span>
                )}
                {college.website && (
                  <a href={college.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />{college.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Courses',   value: college._count?.courses || 0,        icon: BookOpen },
              { label: 'Country',         value: college.country || 'India',           icon: Globe    },
              { label: 'Institution Type',value: college.type || 'Partner',            icon: Award    },
              { label: 'Currency',        value: college.currencyType || 'INR',        icon: Users    },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/10 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <Icon className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                <div className="text-white font-bold text-lg">{value}</div>
                <div className="text-blue-300 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* CTA strip */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Interested in {college.name}?</h3>
            <p className="text-gray-500 text-sm mt-0.5">Get free counselling from our education experts — we'll guide you through admissions.</p>
          </div>
          <a href="/#contact"
            className="flex-shrink-0 px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all text-sm shadow-md">
            Book Free Counselling →
          </a>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-700" />
                  Courses at {college.name}
                  <span className="text-sm text-gray-400 font-normal">({college._count?.courses || 0})</span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">Browse all available programs from this institution</p>
              </div>
              <Link href="/courses" className="text-sm text-blue-700 hover:underline font-medium flex items-center gap-1">
                View All Courses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Filters */}
            {courses.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search courses…"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                </div>
                {streams.length > 0 && (
                  <select value={stream} onChange={e => setStream(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none min-w-[160px]">
                    <option value="">All Streams</option>
                    {streams.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Courses list */}
          <div className="p-6">
            {cLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_,i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {courses.length === 0 ? 'No courses listed for this college yet' : 'No courses match your search'}
                </p>
                {search && <button onClick={() => setSearch('')} className="mt-3 text-blue-700 text-sm hover:underline">Clear search</button>}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(course => {
                  const sym = CURRENCY_SYMBOLS[course.currencyType] || '₹';
                  return (
                    <Link key={course.id} href={`/courses/${course.id}`}
                      className="block border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all group bg-gray-50 hover:bg-white">
                      {/* Stream badge */}
                      {course.stream && (
                        <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium mb-2">
                          {course.stream}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {course.name}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                        {course.degree   && <span className="flex items-center gap-1"><Award className="w-3 h-3" />{course.degree}</span>}
                        {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>}
                      </div>
                      {course.eligibility && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">Eligibility: {course.eligibility}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        {course.fees > 0
                          ? <span className="font-bold text-blue-700 text-sm">{sym}{Number(course.fees).toLocaleString()}<span className="text-xs text-gray-400 font-normal">/yr</span></span>
                          : <span className="text-xs text-gray-400">Fees on request</span>}
                        <span className="text-xs text-blue-700 font-semibold flex items-center gap-0.5 group-hover:gap-1 transition-all">
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
          <Link href="/colleges" className="flex items-center gap-2 text-gray-500 hover:text-blue-700 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to All Colleges
          </Link>
          <div className="flex gap-3">
            <Link href="/courses" className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium">
              Browse All Courses
            </Link>
            <a href="/#contact" className="px-4 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 text-sm font-bold">
              Book Free Counselling
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
