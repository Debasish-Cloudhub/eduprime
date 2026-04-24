'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { authApi } from '../lib/api';
import { GraduationCap, Users, BookOpen, CheckCircle, ArrowRight, Star, Globe, Phone, Mail, Menu, X, Clock, ChevronRight, Shield, Zap } from 'lucide-react';

const COURSES = [
  { name: 'MBA', desc: 'Master of Business Administration', duration: '2 Years', mode: 'Distance / Online', grad: 'from-blue-500 to-blue-700' },
  { name: 'B.Tech', desc: 'Bachelor of Technology', duration: '4 Years', mode: 'Distance / Online', grad: 'from-indigo-500 to-indigo-700' },
  { name: 'BBA', desc: 'Bachelor of Business Administration', duration: '3 Years', mode: 'Distance / Online', grad: 'from-violet-500 to-violet-700' },
  { name: 'MCA', desc: 'Master of Computer Applications', duration: '2 Years', mode: 'Distance / Online', grad: 'from-cyan-500 to-cyan-700' },
  { name: 'B.Sc Nursing', desc: 'Bachelor of Science in Nursing', duration: '4 Years', mode: 'Distance / Online', grad: 'from-teal-500 to-teal-700' },
  { name: 'Study Abroad', desc: 'International University Programs', duration: 'Varies', mode: 'On Campus', grad: 'from-sky-500 to-sky-700' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', course: 'MBA — Bangalore', text: 'ISCC helped me find the perfect distance MBA while working full time. The counselors were incredibly supportive throughout my journey.' },
  { name: 'Rajan Mehta', course: 'B.Tech — Mumbai', text: 'Got admission in my dream college with complete guidance on documents and fees. Highly recommend ISCC to everyone.' },
  { name: 'Anita Patel', course: 'Study Abroad — UK', text: 'From IELTS prep to visa assistance, ISCC handled everything. I am now pursuing my Masters in London.' },
];

const PROCESS = [
  { step: '01', title: 'Register & Enquire', desc: 'Fill your details and tell us your goals', color: 'from-blue-400 to-blue-600' },
  { step: '02', title: 'Free Counseling', desc: 'Our experts guide you to the right course', color: 'from-indigo-400 to-indigo-600' },
  { step: '03', title: 'Apply & Enroll', desc: 'We handle your application end to end', color: 'from-violet-400 to-violet-600' },
  { step: '04', title: 'Start Learning', desc: 'Begin your journey with full support', color: 'from-purple-400 to-purple-600' },
];

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', course: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (token) {
      authApi.me().then(r => {
        const role = r.data?.role;
        if (role === 'STUDENT') router.push('/student');
        else if (role === 'SALES_AGENT') router.push('/sales');
        else if (role === 'FINANCE') router.push('/finance');
        else router.push('/admin');
      }).catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-indigo-800">
      <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xs">IS</span>
            </div>
            <div>
              <span className="text-gray-900 font-black text-base leading-none block">ISCC</span>
              <span className="text-gray-400 text-xs leading-none">International Study & Career Counselling</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#home" className="text-gray-600 hover:text-blue-700 transition-colors">Home</a>
            <a href="#courses" className="text-gray-600 hover:text-blue-700 transition-colors">Courses</a>
            <a href="#about" className="text-gray-600 hover:text-blue-700 transition-colors">About</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-700 transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login" className="px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
              Login
            </Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
              Register Free
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-3 shadow-lg">
            <a href="#home" className="text-gray-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#courses" className="text-gray-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>Courses</a>
            <a href="#about" className="text-gray-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#contact" className="text-gray-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>Contact</a>
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="flex-1 text-center py-2.5 text-sm font-semibold text-blue-700 border border-blue-200 rounded-xl">Login</Link>
              <Link href="/auth/register" className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-xl">Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white/90 text-sm font-medium">14+ Years of Excellence in Education</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
              Shape Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Global Career
              </span><br />
              with ISCC
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
              <Link href="/auth/register" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 font-bold rounded-xl hover:from-yellow-300 hover:to-orange-300 transition-all text-base shadow-xl">
                Register Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border border-white/30 text-white font-medium rounded-xl hover:bg-white/20 transition-all text-base backdrop-blur-sm">
                Student Login
              </Link>
              <a href="#contact" className="flex items-center justify-center gap-2 px-7 py-3.5 border border-yellow-400/40 text-yellow-300 font-medium rounded-xl hover:bg-yellow-400/10 transition-all text-base">
                Book Consultation
              </a>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Get Free Counseling</h3>
                <p className="text-gray-400 text-xs">We'll call you back within 24 hours</p>
              </div>
            </div>
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                <p className="text-gray-500 text-sm">Our counselor will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your Full Name *"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Contact Number *" type="tel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Email Address" type="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-500">
                  <option value="">Select Course of Interest</option>
                  {COURSES.map(c => <option key={c.name}>{c.name}</option>)}
                  <option>Other</option>
                </select>
                <button type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm shadow-lg">
                  Submit Enquiry →
                </button>
                <p className="text-xs text-gray-400 text-center">Your information is safe with us</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 py-8">
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
            <div className="inline-block text-blue-700 font-semibold text-xs mb-3 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">About ISCC</div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">Shaping Global Careers Since 2010</h2>
            <p className="text-gray-600 leading-relaxed mb-6">ISCC (International Study & Career Counselling) has been guiding students to the right educational path since 2010. We specialize in distance learning, online programs, and international education across India and the world.</p>
            <p className="text-gray-600 leading-relaxed mb-8">Our expert counselors handle every step — from course selection and documentation to university applications and scholarship guidance.</p>
            <div className="grid grid-cols-2 gap-3">
              {['Distance Learning', 'Study Abroad', 'Career Guidance', 'Document Support', 'Scholarship Help', 'Visa Assistance'].map(item => (
                <div key={item} className="flex items-center gap-2 text-gray-700 text-sm">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, title: 'UGC Approved', desc: 'University partners are UGC recognized', grad: 'from-blue-500 to-blue-700' },
              { icon: Users, title: 'Expert Counselors', desc: 'Qualified education specialists', grad: 'from-indigo-500 to-indigo-700' },
              { icon: Zap, title: 'Fast Processing', desc: 'Quick application turnaround', grad: 'from-violet-500 to-violet-700' },
              { icon: Globe, title: 'Global Network', desc: 'India & international universities', grad: 'from-cyan-500 to-cyan-700' },
            ].map(({ icon: Icon, title, desc, grad }) => (
              <div key={title} className="rounded-2xl p-5 bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-gray-900 text-sm mb-1">{title}</div>
                <div className="text-gray-500 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="courses" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block text-blue-700 font-semibold text-xs mb-3 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">Our Programs</div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Popular Courses</h2>
            <p className="text-gray-500 max-w-xl mx-auto">UGC-approved distance and online programs from top universities across India and abroad</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map(({ name, desc, duration, mode, grad }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${grad}`} />
                <div className={`w-12 h-12 bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
                <p className="text-gray-500 text-sm mb-4">{desc}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{mode}</span>
                </div>
                <a href="#contact" className="flex items-center gap-1 text-blue-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  Enquire Now <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block text-yellow-400 font-semibold text-xs mb-3 uppercase tracking-widest bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">How It Works</div>
            <h2 className="text-3xl font-black text-white mb-4">Simple 4-Step Process</h2>
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

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block text-blue-700 font-semibold text-xs mb-3 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Student Stories</div>
            <h2 className="text-3xl font-black text-gray-900">What Our Students Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, course, text }, i) => (
              <div key={name} className="rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all bg-gradient-to-br from-white to-blue-50">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['bg-gradient-to-br from-blue-500 to-blue-700', 'bg-gradient-to-br from-indigo-500 to-indigo-700', 'bg-gradient-to-br from-violet-500 to-violet-700'][i]}`}>
                    <span className="text-white font-bold text-sm">{name[0]}</span>
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

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">
          <div>
            <div className="inline-block text-blue-700 font-semibold text-xs mb-3 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">Contact Us</div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-gray-600 mb-8">Our counselors are ready to help you choose the right path to your dream career.</p>
            <div className="space-y-4">
              {[
                { icon: Phone, label: 'Helpline', value: '+91 72059 70889 | +91 94374 87211', grad: 'from-blue-500 to-blue-700' },
                { icon: Mail, label: 'Email', value: 'admin@iscc.in', grad: 'from-indigo-500 to-indigo-700' },
                { icon: Clock, label: 'Office Hours', value: 'Mon – Sat: 9:00 AM – 6:00 PM', grad: 'from-violet-500 to-violet-700' },
              ].map(({ icon: Icon, label, value, grad }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div><div className="text-xs text-gray-500">{label}</div><div className="font-semibold text-gray-900 text-sm">{value}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <input placeholder="Your Name *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <input placeholder="Phone Number *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <input placeholder="Email Address" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <textarea placeholder="Your Message" rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" />
              <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm shadow-lg">
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gradient-to-br from-gray-900 to-blue-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-xs">IS</span>
                </div>
                <div>
                  <span className="text-white font-black block">ISCC</span>
                  <span className="text-gray-400 text-xs">International Study & Career Counselling</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed">India's trusted international education consulting platform since 2010.</p>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Quick Links</div>
              <div className="space-y-2 text-sm">
                {[['#home', 'Home'], ['#courses', 'Courses'], ['#about', 'About Us'], ['#contact', 'Contact']].map(([href, label]) => (
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
                <Link href="/auth/login" className="block hover:text-white transition-colors">Staff / Admin Login</Link>
                <Link href="/auth/login" className="block hover:text-white transition-colors">Student Login</Link>
                <Link href="/auth/register" className="block hover:text-white transition-colors">New Student Registration</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2025 ISCC — International Study & Career Counselling. All rights reserved.</p>
            <div className="flex gap-4"><a href="#" className="hover:text-white">Privacy Policy</a><a href="#" className="hover:text-white">Terms</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
