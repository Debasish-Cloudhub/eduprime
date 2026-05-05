'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Clock, BookOpen, Globe, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iscc-backend-production.up.railway.app/api/v1';
const CURRENCY_SYMBOLS: Record<string, string> = { INR:'₹', USD:'$', EUR:'€', AUD:'A$', CNY:'¥', SGD:'S$' };

interface Course {
  id: string; name: string; stream: string|null; degree: string|null;
  duration: string|null; fees: number; currencyType: string;
  country: string|null; college: { id: string; name: string; city: string|null; country: string };
}

const FALLBACK = [
  { name:'MBA',         desc:'Master of Business Administration',    duration:'2 Years', mode:'Distance / Online' },
  { name:'B.Tech',      desc:'Bachelor of Technology',               duration:'4 Years', mode:'Distance / Online' },
  { name:'BBA',         desc:'Bachelor of Business Administration',  duration:'3 Years', mode:'Distance / Online' },
  { name:'MCA',         desc:'Master of Computer Applications',      duration:'2 Years', mode:'Distance / Online' },
  { name:'B.Sc Nursing',desc:'Bachelor of Science in Nursing',       duration:'4 Years', mode:'Distance / Online' },
  { name:'Study Abroad',desc:'International University Programs',    duration:'Varies',  mode:'On Campus'        },
];

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/public/courses?limit=8`)
      .then(r => r.json())
      .then(d => { setCourses(d?.data || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-700 text-white">Our Programs</div>
          <h2 className="text-3xl font-black text-gray-900 mt-3">Popular Courses</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">UGC-approved distance and online programs from top universities</p>
        </div>

        {/* Loading skeleton */}
        {!loaded && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Real DB data */}
        {loaded && courses.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const sym = CURRENCY_SYMBOLS[course.currencyType] || '₹';
                const loc = course.country || course.college?.country;
                return (
                  <Link key={course.id} href={`/courses?id=${course.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700" />
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md bg-blue-700">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{course.name}</h3>
                    <p className="text-blue-600 text-sm mb-3 line-clamp-1">{course.college?.name}</p>
                    {loc && <div className="flex items-center gap-1 text-xs text-gray-400 mb-2"><Globe className="w-3 h-3" />{loc}</div>}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>}
                      {course.stream  && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.stream}</span>}
                    </div>
                    {course.fees > 0 && <div className="text-sm font-semibold text-gray-700 mb-4">{sym}{Number(course.fees).toLocaleString()} / year</div>}
                    <div className="flex items-center gap-1 font-semibold text-sm text-blue-700 group-hover:gap-2 transition-all">View Details <ChevronRight className="w-4 h-4" /></div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <Link href="/courses" className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg">
                View All Courses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}

        {/* Fallback static data */}
        {loaded && courses.length === 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FALLBACK.map(({ name, desc, duration, mode }) => (
                <Link key={name} href="/courses"
                  className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700" />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md bg-blue-700"><GraduationCap className="w-6 h-6 text-white" /></div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{desc}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{mode}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-sm text-blue-700">Enquire Now <ChevronRight className="w-4 h-4" /></div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/courses" className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg">
                View All Courses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
