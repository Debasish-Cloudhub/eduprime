// Server component — fetches real college data at SSR time
import { GraduationCap, Globe, ChevronRight, BookOpen } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iscc-backend-production.up.railway.app/api/v1';

interface College {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  country: string;
  type: string | null;
  ranking: number | null;
  website: string | null;
  currencyType: string;
  _count: { courses: number };
}

async function fetchColleges(): Promise<College[]> {
  try {
    const res = await fetch(
      `${API_URL}/public/colleges?limit=8&page=1`,
      {
        next: { revalidate: 3600 }, // cache for 1 hour, refresh in background
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const colleges: College[] = data?.data || [];
    // Sort: ranked colleges first (ascending), then by course count (descending)
    return colleges
      .filter(c => c.name)
      .sort((a, b) => {
        if (a.ranking && b.ranking) return a.ranking - b.ranking;
        if (a.ranking) return -1;
        if (b.ranking) return 1;
        return (b._count?.courses || 0) - (a._count?.courses || 0);
      })
      .slice(0, 8);
  } catch {
    return [];
  }
}

// Determine badge style based on college type
function getTypeBadge(type: string | null, country: string) {
  if (!type) {
    return country && country !== 'India'
      ? { label: 'International', cls: 'bg-purple-100 text-purple-700' }
      : { label: 'Partner',       cls: 'bg-blue-100   text-blue-700'   };
  }
  const t = type.toLowerCase();
  if (t.includes('online'))    return { label: 'Online',    cls: 'bg-green-100  text-green-700'  };
  if (t.includes('distance'))  return { label: 'Distance',  cls: 'bg-blue-100   text-blue-700'   };
  if (t.includes('government'))return { label: 'Government',cls: 'bg-amber-100  text-amber-700'  };
  if (t.includes('private'))   return { label: 'Private',   cls: 'bg-indigo-100 text-indigo-700' };
  if (t.includes('deemed'))    return { label: 'Deemed',    cls: 'bg-teal-100   text-teal-700'   };
  return { label: type,       cls: 'bg-gray-100    text-gray-600'   };
}

// Fallback skeleton when no colleges exist yet
function FallbackColleges() {
  const fallbacks = [
    { name: 'Manipal University',      country: 'India',          type: 'Distance', courses: 12 },
    { name: 'Amity University',        country: 'India',          type: 'Online',   courses: 8  },
    { name: 'Symbiosis University',    country: 'India',          type: 'Distance', courses: 6  },
    { name: 'IGNOU',                   country: 'India',          type: 'Distance', courses: 15 },
    { name: 'LPU',                     country: 'India',          type: 'Online',   courses: 10 },
    { name: 'Chandigarh University',   country: 'India',          type: 'Online',   courses: 7  },
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fallbacks.map(({ name, country, type, courses }) => {
        const badge = getTypeBadge(type, country);
        return (
          <CollegeCard
            key={name}
            name={name}
            country={country}
            city={null}
            badge={badge}
            courseCount={courses}
            ranking={null}
            website={null}
          />
        );
      })}
    </div>
  );
}

function CollegeCard({
  name, country, city, badge, courseCount, ranking, website,
}: {
  name: string; country: string; city: string | null;
  badge: { label: string; cls: string }; courseCount: number;
  ranking: number | null; website: string | null;
}) {
  const location = [city, country !== 'India' ? country : null].filter(Boolean).join(', ');
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-blue-700">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{name}</h3>

      {/* Location */}
      {location && (
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
          <Globe className="w-3 h-3 flex-shrink-0" />
          <span>{location}</span>
        </div>
      )}

      {/* Course count + ranking */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
        {courseCount > 0 && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />{courseCount} {courseCount === 1 ? 'course' : 'courses'}
          </span>
        )}
        {ranking && (
          <span className="text-gray-300">·</span>
        )}
        {ranking && <span>Ranked #{ranking}</span>}
      </div>

      <a href="#contact" className="flex items-center gap-1 text-sm font-semibold transition-all text-blue-700 group-hover:gap-2">
        Enquire Now <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  );
}

export default async function CollegesSection() {
  const colleges = await fetchColleges();

  return (
    <section id="colleges" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-700 text-white">
            Our Partners
          </div>
          <h2 className="text-3xl font-black text-gray-900 mt-3">Top Partner Colleges</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            We partner with UGC-approved universities across India and abroad
          </p>
        </div>

        {colleges.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => {
              const badge = getTypeBadge(college.type, college.country);
              return (
                <CollegeCard
                  key={college.id}
                  name={college.name}
                  country={college.country}
                  city={college.city}
                  badge={badge}
                  courseCount={college._count?.courses || 0}
                  ranking={college.ranking}
                  website={college.website}
                />
              );
            })}
          </div>
        ) : (
          <FallbackColleges />
        )}

        {/* Show total count if more than 8 */}
        {colleges.length === 8 && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Showing top 8 partners · Contact us to explore all partner institutions
          </p>
        )}
      </div>
    </section>
  );
}
