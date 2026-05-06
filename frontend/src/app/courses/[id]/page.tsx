'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, GraduationCap, Globe, Clock, BookOpen,
  Building2, DollarSign, Users, ChevronRight, ExternalLink,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iscc-backend-production.up.railway.app/api/v1';
const CURRENCY_SYMBOLS: Record<string, string> = { INR:'₹', USD:'$', EUR:'€', AUD:'A$', CNY:'¥', SGD:'S$' };
const CURRENCY_NAMES: Record<string, string> = { INR:'Indian Rupee', USD:'US Dollar', EUR:'Euro', AUD:'Australian Dollar', CNY:'Chinese Yuan', SGD:'Singapore Dollar' };

interface Course {
  id: string; name: string; stream: string|null; degree: string|null;
  duration: string|null; fees: number; currencyType: string;
  country: string|null; eligibility: string|null; description: string|null;
  seats: number|null; totalFees: number|null;
  college: { id: string; name: string; city: string|null; state: string|null; country: string; website: string|null; type: string|null };
}
interface RelatedCourse {
  id: string; name: string; fees: number; currencyType: string; duration: string|null; stream: string|null;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse]     = useState<Course|null>(null);
  const [related, setRelated]   = useState<RelatedCourse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_URL}/public/courses?limit=200`)
      .then(r => r.json())
      .then(d => {
        const all: Course[] = d?.data || [];
        const found = all.find(c => c.id === id);
        if (found) {
          setCourse(found);
          // Related: same stream or same college, exclude self
          const rel = all.filter(c => c.id !== id && (c.stream === found.stream || c.college?.id === found.college?.id)).slice(0, 4);
          setRelated(rel);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading course details...</p>
      </div>
    </div>
  );

  if (notFound || !course) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Course Not Found</h2>
        <p className="text-gray-400 mb-6">This course may have been removed or the link is incorrect.</p>
        <Link href="/courses" className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800">Browse All Courses</Link>
      </div>
    </div>
  );

  const sym  = CURRENCY_SYMBOLS[course.currencyType] || '₹';
  const curr = CURRENCY_NAMES[course.currencyType]   || course.currencyType;
  const location = course.country || [course.college?.city, course.college?.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/courses" className="flex items-center gap-1.5 text-gray-500 hover:text-blue-700 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> All Courses
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-700 font-medium text-sm truncate max-w-[200px]">{course.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login"    className="px-4 py-2 text-sm font-semibold text-blue-900 border border-blue-900 rounded-xl hover:bg-blue-50">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800">Register Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {course.stream && (
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30 mb-3">
                  {course.stream}
                </span>
              )}
              <h1 className="text-3xl font-black text-white mb-2">{course.name}</h1>
              <Link href={`/colleges/${course.college?.id}`} className="text-blue-300 hover:text-white transition-colors font-medium flex items-center gap-1.5 w-fit">
                <Building2 className="w-4 h-4" />
                {course.college?.name}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              {location && (
                <div className="flex items-center gap-1.5 text-blue-300 text-sm mt-2">
                  <Globe className="w-4 h-4" />{location}
                </div>
              )}
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[
              { label: 'Annual Fees',  value: course.fees > 0 ? `${sym}${Number(course.fees).toLocaleString()}` : 'On Request', sub: curr },
              { label: 'Duration',     value: course.duration || '—',   sub: 'Program Length' },
              { label: 'Degree',       value: course.degree   || '—',   sub: 'Qualification'  },
              { label: 'Seats',        value: course.seats    ? String(course.seats) : '—', sub: 'Available' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-blue-300 text-xs font-medium mb-1">{label}</div>
                <div className="text-white font-black text-lg">{value}</div>
                <div className="text-blue-400 text-xs mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Course Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-700" /> Course Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Program Name',  value: course.name },
                  { label: 'Degree',        value: course.degree },
                  { label: 'Stream',        value: course.stream },
                  { label: 'Duration',      value: course.duration },
                  { label: 'Eligibility',   value: course.eligibility },
                  { label: 'Annual Fees',   value: course.fees > 0 ? `${sym}${Number(course.fees).toLocaleString()} ${course.currencyType}` : 'On Request' },
                  { label: 'Total Fees',    value: course.totalFees ? `${sym}${Number(course.totalFees).toLocaleString()} ${course.currencyType}` : null },
                  { label: 'Seats',         value: course.seats ? String(course.seats) : null },
                  { label: 'Country',       value: location || null },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-xs text-gray-400 font-medium mb-1">{label}</div>
                    <div className="font-semibold text-gray-800 text-sm">{value}</div>
                  </div>
                ))}
              </div>
              {course.description && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-xs text-blue-600 font-medium mb-1">About this Course</div>
                  <p className="text-gray-700 text-sm leading-relaxed">{course.description}</p>
                </div>
              )}
            </div>

            {/* College Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-700" /> About the Institution
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{course.college?.name}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                    {course.college?.city    && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{course.college.city}</span>}
                    {course.college?.country && <span>{course.college.country}</span>}
                    {course.college?.type    && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{course.college.type}</span>}
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/colleges/${course.college?.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                      View All Courses at this College <ChevronRight className="w-4 h-4" />
                    </Link>
                    {course.college?.website && (
                      <a href={course.college.website} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        Website <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Courses */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-700" /> Related Courses
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {related.map(r => {
                    const s = CURRENCY_SYMBOLS[r.currencyType] || '₹';
                    return (
                      <Link key={r.id} href={`/courses/${r.id}`}
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                        <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700">{r.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                            {r.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.duration}</span>}
                            {r.fees > 0 && <span>{s}{Number(r.fees).toLocaleString()}/yr</span>}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — CTA */}
          <div className="space-y-4">
            {/* Enquire card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-20">
              <h3 className="font-bold text-gray-900 text-base mb-1">Interested in this course?</h3>
              <p className="text-gray-500 text-sm mb-5">Get free counselling from our expert advisors. We'll help you with admission, fees, and documents.</p>
              <a href="/#contact"
                className="block w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all text-sm text-center mb-3">
                Book Free Counselling
              </a>
              <Link href="/auth/register"
                className="block w-full py-3 border-2 border-blue-700 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all text-sm text-center">
                Register Free
              </Link>

              {/* Key highlights */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                {[
                  { icon: Users,       text: '2000+ students guided since 2010' },
                  { icon: Clock,       text: 'Quick admission processing'        },
                  { icon: DollarSign,  text: 'Fee guidance & scholarship help'   },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-700" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Browse more */}
            <Link href="/courses"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">
              Browse All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
