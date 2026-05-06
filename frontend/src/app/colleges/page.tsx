'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, Building2, Globe, ChevronRight, MapPin, X, ArrowLeft, BookOpen, Clock } from 'lucide-react';

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
  duration: string|null; fees: number; currencyType: string; country: string|null;
  eligibility: string|null; college: { id: string; name: string; city: string|null; country: string };
}

function getTypeBadge(type: string|null, country: string) {
  if (!type) return country !== 'India' ? { label:'International', cls:'bg-purple-100 text-purple-700' } : { label:'Partner', cls:'bg-blue-100 text-blue-700' };
  const t = type.toLowerCase();
  if (t.includes('online'))     return { label:'Online',     cls:'bg-green-100 text-green-700'  };
  if (t.includes('distance'))   return { label:'Distance',   cls:'bg-blue-100  text-blue-700'   };
  if (t.includes('government')) return { label:'Government', cls:'bg-amber-100 text-amber-700'  };
  if (t.includes('private'))    return { label:'Private',    cls:'bg-indigo-100 text-indigo-700'};
  return { label: type, cls: 'bg-gray-100 text-gray-600' };
}

export default function CollegesPage() {
  const [colleges, setColleges]       = useState<College[]>([]);
  const [countries, setCountries]     = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [countryFilter, setCountry]   = useState('');

  // Fetch all available countries
  useEffect(() => {
    fetch(`${API_URL}/public/colleges?limit=200`)
      .then(r => r.json())
      .then(d => {
        const cSet = new Set<string>((d?.data || []).map((c: College) => c.country).filter(Boolean));
        setCountries(Array.from(cSet).sort());
      })
      .catch(() => {});
  }, []);

  // Fetch all available countries
  useEffect(() => {
    fetch(`${API_URL}/public/colleges?limit=200`)
      .then(r => r.json())
      .then(d => {
        const cSet = new Set<string>((d?.data || []).map((c: College) => c.country).filter(Boolean));
        setCountries(Array.from(cSet).sort());
      })
      .catch(() => {});
  }, []);

  // Check URL for ?id= on mount
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
      fetch(`${API_URL}/public/colleges?limit=100`)
        .then(r => r.json())
        .then(d => { const c = d?.data?.find((x: College) => x.id === id);  });
    }
  }, []);

  // Fetch available countries from colleges
  useEffect(() => {
    fetch(`${API_URL}/public/colleges?limit=200`)
      .then(r => r.json())
      .then(d => {
        const cSet = new Set<string>((d?.data || []).map((c: College) => c.country).filter(Boolean));
        setCountries(Array.from(cSet).sort());
      });
  }, []);

  // Fetch colleges
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (search)        params.set('search',  search);
    if (countryFilter) params.set('country', countryFilter);
    fetch(`${API_URL}/public/colleges?${params}`)
      .then(r => r.json())
      .then(d => setColleges(d?.data || []))
      .finally(() => setLoading(false));
  }, [search, countryFilter]);

  const hasFilters = search || countryFilter;

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
            <span className="font-bold text-gray-900">Partner Colleges</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login"    className="px-4 py-2 text-sm font-semibold text-blue-900 border border-blue-900 rounded-xl hover:bg-blue-50">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800">Register Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Partner Colleges & Universities</h1>
          <p className="text-gray-500">{colleges.length} institutions across India and abroad. Click any college to view its courses.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search colleges…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <select value={countryFilter} onChange={e => setCountry(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none min-w-[160px]">
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setCountry(''); }} className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:border-red-200 hover:text-red-600">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Colleges Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No colleges found</h3>
            {hasFilters && <button onClick={() => { setSearch(''); setCountry(''); }} className="mt-4 text-blue-700 text-sm hover:underline">Clear filters</button>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map(college => {
              const badge = getTypeBadge(college.type, college.country);
              const location = [college.city, college.state, college.country !== 'India' ? college.country : null].filter(Boolean).join(', ');
              return (
                <Link key={college.id} href={`/colleges/${college.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-blue-700">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">{college.name}</h3>
                  {location && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{location}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      {college._count?.courses || 0} {college._count?.courses === 1 ? 'course' : 'courses'}
                    </span>
                    <span className="text-blue-700 text-xs font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                      View Courses <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
}