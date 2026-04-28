import Link from 'next/link';
import { Star, Phone, Mail, Clock, CheckCircle, ArrowRight, ChevronRight, BookOpen, GraduationCap, Globe, Shield, Zap, Users, Menu } from 'lucide-react';
import AuthRedirect from '@/components/AuthRedirect';
import EnquiryForm from '@/components/EnquiryForm';
import ContactForm from '@/components/ContactForm';

// ── DATA ─────────────────────────────────────────────────────────────────────
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

const COLLEGES = [
  { name: 'Manipal University',          courses: 'MBA, BBA, MCA', type: 'Distance' },
  { name: 'Amity University',            courses: 'MBA, B.Tech',    type: 'Online'   },
  { name: 'Symbiosis University',        courses: 'MBA, BBA',       type: 'Distance' },
  { name: 'IGNOU',                       courses: 'All Programs',   type: 'Distance' },
  { name: 'LPU (Lovely Professional)',   courses: 'MBA, B.Tech, BCA', type: 'Online' },
  { name: 'Chandigarh University',       courses: 'MBA, MCA',       type: 'Online'   },
];

const PROCESS = [
  { step: '01', title: 'Register & Enquire',  desc: 'Fill your details and tell us your goals',    color: 'from-[#0575e6] to-[#034db5]' },
  { step: '02', title: 'Free Counseling',     desc: 'Our experts guide you to the right course',   color: 'from-[#034db5] to-[#022b6b]' },
  { step: '03', title: 'Apply & Enroll',      desc: 'We handle your application end to end',       color: 'from-[#022b6b] to-[#021b79]' },
  { step: '04', title: 'Start Learning',      desc: 'Begin your journey with full support',        color: 'from-[#021b79] to-[#0575e6]' },
];

// ── SERVER COMPONENT (renders in HTML — no JS needed) ──────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Auth redirect — tiny client island */}
      <AuthRedirect />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/iscc-logo.svg" alt="ISCC" width="36" height="36" />
            <div>
              <span className="font-black text-base leading-none block">
                <span className="text-[#021b79]">ISCC</span>
                <span className="text-red-600"> Digital</span>
              </span>
              <span className="text-gray-400 text-[9px] leading-none uppercase tracking-widest">International Study & Career Counselling</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#home"         className="text-gray-600 hover:text-[#0575e6] transition-colors">Home</a>
            <a href="#testimonials" className="text-gray-600 hover:text-[#0575e6] transition-colors">Reviews</a>
            <a href="#colleges"     className="text-gray-600 hover:text-[#0575e6] transition-colors">Colleges</a>
            <a href="#courses"      className="text-gray-600 hover:text-[#0575e6] transition-colors">Courses</a>
            <a href="#contact"      className="text-gray-600 hover:text-[#0575e6] transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login"    className="px-4 py-2 text-sm font-semibold text-[#021b79] border border-[#021b79] rounded-xl hover:bg-blue-50 transition-colors">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all shadow-md" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}}>Register Free</Link>
          </div>
          {/* Mobile menu handled by CSS only */}
          <div className="md:hidden flex gap-2">
            <Link href="/auth/login"    className="px-3 py-2 text-xs font-semibold text-[#021b79] border border-[#021b79] rounded-lg">Login</Link>
            <Link href="/auth/register" className="px-3 py-2 text-xs font-semibold text-white rounded-lg" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}}>Register</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="pt-16 min-h-screen flex items-center relative overflow-hidden" style={{background:'linear-gradient(135deg,#021b79 0%,#0347b5 50%,#0575e6 100%)'}}>
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
          {/* Enquiry Form — client island */}
          <EnquiryForm courses={COURSES.map(c => c.name)} />
        </div>
      </section>

      {/* ── TESTIMONIALS ── immediately after hero */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full" style={{background:'linear-gradient(135deg,#0575e6,#021b79)',color:'white'}}>Student Stories</div>
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}}>
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

      {/* ── COLLEGES ── below testimonials */}
      <section id="colleges" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full" style={{background:'linear-gradient(135deg,#0575e6,#021b79)',color:'white'}}>Our Partners</div>
            <h2 className="text-3xl font-black text-gray-900 mt-3">Top Partner Colleges</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">We partner with UGC-approved universities across India and abroad</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COLLEGES.map(({ name, courses, type }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}}>
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${type === 'Online' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{type}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">{name}</h3>
                <p className="text-gray-500 text-sm mb-4">{courses}</p>
                <a href="#contact" className="flex items-center gap-1 text-sm font-semibold transition-all" style={{color:'#0575e6'}}>
                  Enquire Now <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full" style={{background:'linear-gradient(135deg,#0575e6,#021b79)',color:'white'}}>Our Programs</div>
            <h2 className="text-3xl font-black text-gray-900 mt-3">Popular Courses</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">UGC-approved distance and online programs from top universities</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map(({ name, desc, duration, mode }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
                <p className="text-gray-500 text-sm mb-4">{desc}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{mode}</span>
                </div>
                <a href="#contact" className="flex items-center gap-1 font-semibold text-sm group-hover:gap-2 transition-all" style={{color:'#0575e6'}}>
                  Enquire Now <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / FREE COUNSELLING ── moved lower after courses */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">
          <div>
            <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full" style={{background:'linear-gradient(135deg,#0575e6,#021b79)',color:'white'}}>Free Counselling</div>
            <h2 className="text-3xl font-black text-gray-900 mt-3 mb-6">Get In Touch</h2>
            <p className="text-gray-600 mb-8">Our counselors are ready to guide you to the right course and college. Book your free counselling session today.</p>
            <div className="space-y-4">
              {[
                { icon: Phone, label: 'Helpline', value: '+91 72059 70889 | +91 94374 87211' },
                { icon: Mail,  label: 'Email',    value: 'admin@iscc.in' },
                { icon: Clock, label: 'Office Hours', value: 'Mon – Sat: 9:00 AM – 6:00 PM' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="font-semibold text-gray-900 text-sm">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Book Free Counselling</h3>
            <p className="text-gray-500 text-sm mb-6">Fill the form and our expert will call you back within 24 hours</p>
            <ContactForm courses={COURSES.map(c => c.name)} />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ value: '14+', label: 'Years of Excellence' }, { value: '2000+', label: 'Success Stories' }, { value: '99%', label: 'Employment Rate' }, { value: '100%', label: 'Career Upliftment' }].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-black text-blue-900">{value}</div>
              <div className="text-blue-800 text-sm font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block font-semibold text-xs mb-3 uppercase tracking-widest px-3 py-1 rounded-full" style={{background:'linear-gradient(135deg,#0575e6,#021b79)',color:'white'}}>About ISCC</div>
            <h2 className="text-3xl font-black text-gray-900 mt-3 mb-6">Shaping Global Careers Since 2010</h2>
            <p className="text-gray-600 leading-relaxed mb-6">ISCC (International Study & Career Counselling) has been guiding students to the right educational path since 2010. We specialize in distance learning, online programs, and international education across India and the world.</p>
            <div className="grid grid-cols-2 gap-3">
              {['Distance Learning', 'Study Abroad', 'Career Guidance', 'Document Support', 'Scholarship Help', 'Visa Assistance'].map(item => (
                <div key={item} className="flex items-center gap-2 text-gray-700 text-sm">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}}>
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, title: 'UGC Approved',     desc: 'University partners are UGC recognized' },
              { icon: Users,  title: 'Expert Counselors', desc: 'Qualified education specialists' },
              { icon: Zap,    title: 'Fast Processing',  desc: 'Quick application turnaround' },
              { icon: Globe,  title: 'Global Network',   desc: 'India & international universities' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-5 bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-md" style={{background:'linear-gradient(135deg,#0575e6,#021b79)'}}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-gray-900 text-sm mb-1">{title}</div>
                <div className="text-gray-500 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-20 relative overflow-hidden" style={{background:'linear-gradient(135deg,#021b79 0%,#022b6b 50%,#0347b5 100%)'}}>
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
      <footer className="text-gray-400 py-12" style={{background:'linear-gradient(135deg,#021b79 0%,#010d3d 100%)'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/iscc-logo.svg" alt="ISCC" width="32" height="32" />
                <div>
                  <span className="text-white font-black block">ISCC Digital</span>
                  <span className="text-gray-400 text-xs">International Study & Career Counselling</span>
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
                {COURSES.map(c => <a key={c.name} href="#courses" className="block hover:text-white transition-colors">{c.name}</a>)}
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
}
