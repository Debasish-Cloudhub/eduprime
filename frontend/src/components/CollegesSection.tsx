'use client';
import { useEffect, useState } from 'react';
import { GraduationCap, Globe, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iscc-backend-production.up.railway.app/api/v1';

interface College {
  id: string; name: string; city: string|null; state: string|null;
  country: string; type: string|null; ranking: number|null;
  website: string|null; currencyType: string; _count: { courses: number };
}

function getTypeBadge(type: string|null, country: string) {
  if (!type) return country !== 'India' ? { label:'International', cls:'bg-purple-100 text-purple-700' } : { label:'Partner', cls:'bg-blue-100 text-blue-700' };
  const t = type.toLowerCase();
  if (t.includes('online'))     return { label:'Online',     cls:'bg-green-100  text-green-700'  };
  if (t.includes('distance'))   return { label:'Distance',   cls:'bg-blue-100   text-blue-700'   };
  if (t.includes('government')) return { label:'Government', cls:'bg-amber-100  text-amber-700'  };
  if (t.includes('private'))    return { label:'Private',    cls:'bg-indigo-100 text-indigo-700' };
  return { label: type, cls: 'bg-gray-100 text-gray-600' };
}

const FALLBACK = [
  { name:'Manipal University',        country:'India',   type:'Distance' },
  { name:'Amity University',          country:'India',   type:'Online'   },
  { name:'Symbiosis University',      country:'India',   type:'Distance' },
  { name:'IGNOU',                     country:'India',   type:'Distance' },
  { name:'LPU',                       country:'India',   type:'Online'   },
  { name:'Chandigarh University',     country:'India',   type:'Online'   },
];

export default function CollegesSection() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loaded, setLoaded]     = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/public/colleges?limit=8`)
      .then(r => r.json())
      .then(d => {
        const data: College[] = (d?.data || [])
          .sort((a: College, b: College) => {
            if (a.ranking && b.ranking) return a.ranking - b.ranking;
            if (a.ranking) return -1;
            if (b.ranking) return 1;
            return (b._count?.courses || 0) - (a._count?.courses || 0);
          })
          .slice(0, 8);
        setColleges(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <section id="colleges" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-700 text-white">Our Partners</div>
          <h2 className="text-3xl font-black text-gray-900 mt-3">Top Partner Colleges</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">We partner with UGC-approved universities across India and abroad</p>
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
        {loaded && colleges.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map(college => {
                const badge = getTypeBadge(college.type, college.country);
                const loc = [college.city, college.country !== 'India' ? college.country : null].filter(Boolean).join(', ');
                return (
                  <Link key={college.id} href={`/colleges?id=${college.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-blue-700"><GraduationCap className="w-6 h-6 text-white" /></div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{college.name}</h3>
                    {loc && <div className="flex items-center gap-1 text-gray-400 text-xs mb-1"><Globe className="w-3 h-3 flex-shrink-0" />{loc}</div>}
                    <div className="flex items-center justify-between mt-3">
                      {college._count?.courses > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-400"><BookOpen className="w-3 h-3" />{college._count.courses} courses</span>
                      )}
                      <span className="flex items-center gap-1 text-sm font-semibold text-blue-700 group-hover:gap-2 transition-all">
                        View <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/colleges" className="inline-flex items-center gap-2 px-6 py-3 border border-blue-700 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm">
                View All Colleges <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}

        {/* Fallback */}
        {loaded && colleges.length === 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FALLBACK.map(({ name, country, type }) => {
              const badge = getTypeBadge(type, country);
              return (
                <Link key={name} href="/colleges" className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-blue-700"><GraduationCap className="w-6 h-6 text-white" /></div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{name}</h3>
                  <a href="#contact" className="flex items-center gap-1 text-sm font-semibold text-blue-700 mt-4 group-hover:gap-2 transition-all">Enquire Now <ChevronRight className="w-4 h-4" /></a>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
