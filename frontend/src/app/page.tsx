import Link from 'next/link';
import { Star, Phone, Mail, Clock, CheckCircle, ArrowRight, ChevronRight, BookOpen, GraduationCap, Globe, Shield, Zap, Users, Menu } from 'lucide-react';
import ISCCLogo from '@/components/ui/ISCCLogo';
import AuthRedirect from '@/components/AuthRedirect';
import ContactForm from '@/components/ContactForm';
import CollegesSection from '@/components/CollegesSection';
import CoursesSection from '@/components/CoursesSection';

// ── DATA ──────────────────────────────────────────────────────────────── v20260430075018
const COURSES = [
  { name: 'MBA',          desc: 'Master of Business Administration',  duration: '2 Years',  mode: 'Distance / Online' },
  { name: 'B.Tech',       desc: 'Bachelor of Technology',             duration: '4 Years',  mode: 'Distance / Online' },
  { name: 'BBA',          desc: 'Bachelor of Business Administration', duration: '3 Years', mode: 'Distance / Online' },
  { name: 'MCA',          desc: 'Master of Computer Applications',    duration: '2 Years',  mode: 'Distance / Online' },
  { name: 'B.Sc Nursing', desc: 'Bachelor of Science in Nursing',     duration: '4 Years',  mode: 'Distance / Online' },
  { name: 'Study Abroad', desc: 'International University Programs',  duration: 'Varies',   mode: 'On Campus'         },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',  course: 'MBA — Bangalore', text: 'ISCC helped me find the perfect distance MBA while working full time. The counselors were incredibly supportive throughout my journey.' },
  { name: 'Rajan Mehta',   course: 'B.Tech — Mumbai', text: 'Got admission in my dream college with complete guidance on documents and fees. Highly recommend ISCC to everyone.' },
  { name: 'Anita Patel',   course: 'Study Abroad — UK', text: 'From IELTS prep to visa assistance, ISCC handled everything. I am now pursuing my Masters in London.' },
];

// Colleges fetched from DB — see CollegesSection component

const PROCESS = [
  { step: '01', title: 'Register & Enquire',  desc: 'Fill your details and tell us your goals',    color: 'from-blue-500 to-blue-700' },
  { step: '02', title: 'Free Counseling',     desc: 'Our experts guide you to the right course',   color: 'from-blue-600 to-blue-800' },
  { step: '03', title: 'Apply & Enroll',      desc: 'We handle your application end to end',       color: 'from-blue-800 to-blue-900' },
  { step: '04', title: 'Start Learning',      desc: 'Begin your journey with full support',        color: 'from-blue-900 to-blue-600' },
];

// ── SERVER COMPONENT (renders in HTML — no JS needed) ──────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Auth redirect — tiny client island */}
      <AuthRedirect />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/iscc-logo.svg" alt="ISCC" width="36" height="36" />
            <div>
              <div className="font-black text-sm leading-tight">
                <span className="text-blue-900">ISCC</span>
                <span className="text-red-600"> Digital</span>
              </div>
              <div style={{fontSize:'9px',color:'#6b7280',letterSpacing:'0.1em',textTransform:'uppercase'}}>International Study &amp; Career Counselling</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#home"         className="text-gray-600 hover:text-blue-600 transition-colors">Home</a>
            <a href="#about-us"     className="text-gray-600 hover:text-blue-600 transition-colors">About Us</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Reviews</a>
            <a href="#colleges"     className="text-gray-600 hover:text-blue-600 transition-colors">Colleges</a>
            <a href="#courses"      className="text-gray-600 hover:text-blue-600 transition-colors">Courses</a>
            <a href="#contact"      className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login"    className="px-4 py-2 text-sm font-semibold text-blue-900 border border-blue-900 rounded-xl hover:bg-blue-50 transition-colors">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all shadow-md">Register Free</Link>
          </div>
          {/* Mobile menu handled by CSS only */}
          <div className="md:hidden flex gap-2">
            <Link href="/auth/login"    className="px-3 py-2 text-xs font-semibold text-blue-900 border border-blue-900 rounded-lg">Login</Link>
            <Link href="/auth/register" className="px-3 py-2 text-xs font-semibold text-white rounded-lg bg-blue-700">Register</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="pt-16 min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white/90 text-sm font-medium">14+ Years of Excellence in Education</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
              Shape Your<br />
              <span className="text-yellow-400">Global Career</span><br />
              with ISCC Digital
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-lg">
              International Study & Career Counselling — guiding students since 2010 from distance learning to study abroad, with end-to-end education consulting for every career goal.
            </p>
            <div className="flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 w-fit">
              <Phone className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-blue-200 text-xs">Helpline (Mon–Sat, 9AM–6PM)</p>
                <p className="text-white font-bold text-sm">+91 72059 70889 | +91 94374 87211</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/register" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-yellow-400 text-blue-900 font-bold rounded-xl hover:bg-yellow-300 text-base shadow-xl transition-all">
                Register Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border border-white/30 text-white font-medium rounded-xl hover:bg-white/20 text-base">
                Student Login
              </Link>
              <a href="#contact" className="flex items-center justify-center gap-2 px-7 py-3.5 border border-yellow-400/40 text-yellow-300 font-medium rounded-xl hover:bg-yellow-400/10 text-base">
                Book Consultation
              </a>
            </div>
          </div>
          {/* Student hero image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-3xl blur-2xl" />
              <img
                src="/student-hero.png"
                alt="ISCC Digital Student"
                className="relative z-10 rounded-3xl shadow-2xl object-cover"
                style={{maxHeight: '480px', maxWidth: '420px', width: '100%'}}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-5 py-3 z-20">
                <div className="text-xs text-gray-500 font-medium">Success Rate</div>
                <div className="text-2xl font-black text-blue-900">99%</div>
                <div className="text-xs text-gray-400">Employment Rate</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-5 py-3 z-20">
                <div className="text-xs text-gray-500 font-medium">Students Guided</div>
                <div className="text-2xl font-black text-blue-900">2000+</div>
                <div className="text-xs text-gray-400">Since 2010</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── immediately after hero */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-700 text-white">Student Stories</div>
            <h2 className="text-3xl font-black text-gray-900 mt-3">What Our Students Say</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">Real stories from students who transformed their careers with ISCC Digital</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, course, text }, i) => (
              <div key={name} className="rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all bg-gradient-to-br from-white to-blue-50">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-blue-700">
                    {name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{name}</div>
                    <div className="text-gray-500 text-xs">{course}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLEGES ── fetched from real database ──────────────────────────── */}
      <CollegesSection />

      {/* ── COURSES ── real data from DB ──────────────────────────────────── */}
      <CoursesSection />

            {/* ── ABOUT US + MD SECTION ── */}
      <section id="about-us" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4">

          {/* About ISCC */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-700 text-white">About ISCC Digital</div>
              <h2 className="text-3xl font-black text-gray-900 mt-3 mb-6">Transforming Academic Aspirations into Successful Careers</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ISCC Digital is a progressive education consulting and learning solutions organization committed to transforming academic aspirations into successful careers. Since 2010, we have been guiding students toward the right educational pathways through domestic admissions, study abroad consulting, and flexible learning opportunities.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                What began as an initiative to support students who had discontinued their studies due to personal, professional, or financial circumstances has evolved into a comprehensive education support platform serving learners across multiple disciplines and destinations.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Domestic University Admissions',
                  'Study Abroad Counseling',
                  'Online & Distance Learning',
                  'IELTS & Language Preparation',
                  'Career Guidance & Counseling',
                  'University Application Assistance',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-gray-700 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-700">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'UGC Approved',      desc: 'All university partners are UGC recognised' },
                { icon: Users,  title: 'Expert Counselors', desc: 'Qualified education specialists since 2010' },
                { icon: Zap,    title: 'Fast Processing',   desc: 'Quick application turnaround guaranteed' },
                { icon: Globe,  title: 'Global Network',    desc: 'India & international university partners' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl p-5 bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-md bg-blue-700">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-bold text-gray-900 text-sm mb-1">{title}</div>
                  <div className="text-gray-500 text-xs">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* MD Message */}
          <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-5 gap-0">
              {/* MD Photo */}
              <div className="lg:col-span-2 relative">
                <img
                  src="/md-photo.jpg"
                  alt="Priyabrat Das — Managing Director, ISCC Digital Study"
                  className="w-full h-full object-cover object-top min-h-[400px] lg:min-h-full"
                  style={{maxHeight:'520px'}}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-950/90 to-transparent p-6">
                  <div className="text-white font-black text-lg">Priyabrat Das</div>
                  <div className="text-blue-300 text-sm">Managing Director</div>
                  <div className="text-blue-400 text-xs mt-0.5">ISCC Digital Study</div>
                </div>
              </div>
              {/* MD Message */}
              <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                <div className="text-yellow-400 text-5xl font-serif mb-4 leading-none">"</div>
                <h3 className="text-white font-black text-2xl mb-6">Message from the Managing Director</h3>
                <div className="space-y-4 text-blue-100 leading-relaxed text-sm">
                  <p>At ISCC, our journey has always been driven by one simple belief — every student deserves a second opportunity to learn, grow, and succeed.</p>
                  <p>Since 2010, we have worked closely with students from diverse backgrounds, many of whom had paused or discontinued their education due to personal responsibilities, career challenges, or financial limitations. Our goal has been to help them restart their academic journey with the right guidance and support.</p>
                  <p>Today, education is no longer limited by geography or traditional classrooms. With the rapid growth of online and digital learning ecosystems, students now have access to global opportunities like never before. ISCC is proud to be part of this transformation.</p>
                  <p>Our commitment is not only towards admissions, but towards helping students make informed decisions that positively shape their professional and personal future.</p>
                  <p className="text-blue-200 italic">The future belongs to learners, and we are here to guide them every step of the way.</p>
                </div>
                <div className="mt-8 pt-6 border-t border-blue-800 flex items-center gap-4">
                  <div>
                    <div className="text-white font-bold">— Priyabrat Das</div>
                    <div className="text-blue-400 text-sm">Managing Director, ISCC Digital Study</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

            {/* ── PROCESS ── */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block text-yellow-400 font-semibold text-xs mb-3 uppercase tracking-widest bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">How It Works</div>
            <h2 className="text-3xl font-black text-white mt-3 mb-2">Simple 4-Step Process</h2>
            <p className="text-blue-200 max-w-xl mx-auto">From enquiry to enrollment, we make your education journey seamless</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map(({ step, title, desc, color }) => (
              <div key={step} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                  <span className="text-white font-black text-lg">{step}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-blue-200 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="text-gray-400 py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/iscc-logo.svg" alt="ISCC" width="32" height="32" />
              <div>
                <div className="font-black"><span style={{color:'#93c5fd'}}>ISCC</span><span className="text-red-600"> Digital</span></div>
                <div style={{fontSize:'10px',color:'#9ca3af'}}>International Study &amp; Career Counselling</div>
              </div>
              </div>
              <p className="text-sm leading-relaxed">India's trusted international education consulting platform since 2010.</p>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Quick Links</div>
              <div className="space-y-2 text-sm">
                {[['#home','Home'],['#courses','Courses'],['#colleges','Colleges'],['#contact','Contact']].map(([href,label]) => (
                  <a key={label} href={href} className="block hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Programs</div>
              <div className="space-y-2 text-sm">
                <a href="/courses" className="block hover:text-white transition-colors">View All Courses →</a>
              </div>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Portal Access</div>
              <div className="space-y-2 text-sm">
                <Link href="/auth/login"    className="block hover:text-white transition-colors">Staff / Admin Login</Link>
                <Link href="/auth/login"    className="block hover:text-white transition-colors">Student Login</Link>
                <Link href="/auth/register" className="block hover:text-white transition-colors">New Student Registration</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2025 ISCC Digital — International Study & Career Counselling. All rights reserved.</p>
            <div className="flex gap-4"><a href="#" className="hover:text-white">Privacy Policy</a><a href="#" className="hover:text-white">Terms</a></div>
          </div>
        </div>
      </footer>

    </div>
  );
}// cache-bust: Thu Apr 30 07:14:38 UTC 2026
// deployed: 20260430072053
