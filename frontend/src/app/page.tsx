'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { authApi } from '../lib/api';
import { GraduationCap, Users, TrendingUp, Award, BookOpen, CheckCircle, ArrowRight, Star, Globe, Phone, Mail, BarChart2, Menu, X, Clock, ChevronRight, Building2, Plane, Briefcase, Heart, Shield, Zap } from 'lucide-react';

const COURSES = [
  { name: 'MBA', desc: 'Master of Business Administration', duration: '2 Years', mode: 'Distance / Online' },
  { name: 'B.Tech', desc: 'Bachelor of Technology', duration: '4 Years', mode: 'Distance / Online' },
  { name: 'BBA', desc: 'Bachelor of Business Administration', duration: '3 Years', mode: 'Distance / Online' },
  { name: 'MCA', desc: 'Master of Computer Applications', duration: '2 Years', mode: 'Distance / Online' },
  { name: 'B.Sc Nursing', desc: 'Bachelor of Science in Nursing', duration: '4 Years', mode: 'Distance / Online' },
  { name: 'Study Abroad', desc: 'International University Programs', duration: 'Varies', mode: 'On Campus' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', course: 'MBA — Bangalore', text: 'EduPrime helped me find the perfect distance MBA while working full time. Incredibly supportive throughout.' },
  { name: 'Rajan Mehta', course: 'B.Tech — Mumbai', text: 'Got admission in my dream college with complete guidance on documents and fees. Highly recommend!' },
  { name: 'Anita Patel', course: 'Study Abroad — UK', text: 'From IELTS prep to visa assistance, EduPrime handled everything. I am now studying in London.' },
];

const PROCESS = [
  { step: '01', title: 'Register & Enquire', desc: 'Fill your details and tell us your goals' },
  { step: '02', title: 'Free Counseling', desc: 'Our experts guide you to the right course' },
  { step: '03', title: 'Apply & Enroll', desc: 'We handle your application end to end' },
  { step: '04', title: 'Start Learning', desc: 'Begin your journey with full support' },
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
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">EP</span>
            </div>
            <div>
              <span className="text-blue-800 font-black text-lg leading-none block">EduPrime</span>
              <span className="text-gray-400 text-xs leading-none">Education Consulting</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#home" className="text-gray-700 hover:text-blue-700">Home</a>
            <a href="#courses" className="text-gray-700 hover:text-blue-700">Courses</a>
            <a href="#services" className="text-gray-700 hover:text-blue-700">About</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-700">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login" className="px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-50">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800">Register Free</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-3 shadow-lg">
            <a href="#home" className="text-gray-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#courses" className="text-gray-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>Courses</a>
            <a href="#services" className="text-gray-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#contact" className="text-gray-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>Contact</a>
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="flex-1 text-center py-2 text-sm font-semibold text-blue-700 border border-blue-700 rounded-lg">Login</Link>
              <Link href="/auth/register" className="flex-1 text-center py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg">Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="pt-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">14+ Years of Excellence in Education</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5">
              Your Dream<br /><span className="text-yellow-400">Education</span><br />Starts Here
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-lg">
              EduPrime has been guiding students since 2010 — from distance learning to study abroad, providing end-to-end education consulting for every career goal.
            </p>
            <div className="flex items-center gap-3 mb-8 bg-blue-800/50 rounded-xl px-4 py-3 w-fit">
              <Phone className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-blue-300 text-xs">Helpline (Mon–Sat, 9AM–6PM)</p>
                <p className="text-white font-bold text-sm">+91 72059 70889 | +91 94374 87211</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/register" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-yellow-400 text-blue-900 font-bold rounded-xl hover:bg-yellow-300 text-base shadow-lg">
                Register Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border border-white/30 text-white font-medium rounded-xl hover:bg-white/20 text-base">
                Student Login
              </Link>
              <a href="#contact" className="flex items-center justify-center gap-2 px-7 py-3.5 border border-yellow-400/50 text-yellow-300 font-medium rounded-xl hover:bg-yellow-400/10 text-base">
                Book Consultation
              </a>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-xl font-black text-gray-900 mb-1">Get Free Counseling</h3>
            <p className="text-gray-500 text-sm mb-6">Our expert will call you back within 24 hours</p>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                <p className="text-gray-500">Our counselor will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your Full Name *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Contact Number *" type="tel" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email Address" type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-500">
                  <option value="">Select Course of Interest</option>
                  {COURSES.map(c => <option key={c.name}>{c.name}</option>)}
                  <option>Other</option>
                </select>
                <button type="submit" className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 text-sm">Submit Enquiry</button>
                <p className="text-xs text-gray-400 text-center">By submitting you agree to our privacy policy</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-yellow-400 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ value: '14+', label: 'Years of Excellence' }, { value: '2000+', label: 'Success Stories' }, { value: '99%', label: 'Employment Rate' }, { value: '100%', label: 'Career Upliftment' }].map(({ value, label }) => (
            <div key={label}><div className="text-3xl font-black text-blue-900">{value}</div><div className="text-blue-800 text-sm font-medium mt-1">{label}</div></div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-blue-600 font-semibold text-sm mb-3 uppercase tracking-wider">About EduPrime</div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">Shaping Futures Since 2010</h2>
            <p className="text-gray-600 leading-relaxed mb-6">The journey of providing distance learning and online education to students who have discontinued their studies started in 2010. EduPrime leads in ODL (Online and Digital Learning) systems of universities and institutions across India and abroad.</p>
            <p className="text-gray-600 leading-relaxed mb-8">Our expert counselors guide students from course selection to enrollment, handling every step including documentation, university applications, and scholarship guidance.</p>
            <div className="grid grid-cols-2 gap-3">
              {['Distance Learning', 'Study Abroad', 'Career Guidance', 'Document Support', 'Scholarship Help', 'Visa Assistance'].map(item => (
                <div key={item} className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />{item}</div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ icon: Shield, title: 'Trusted Platform', desc: 'UGC approved university partners' }, { icon: Users, title: 'Expert Counselors', desc: 'Qualified education specialists' }, { icon: Zap, title: 'Fast Processing', desc: 'Quick application turnaround' }, { icon: Globe, title: 'Global Network', desc: 'India & international universities' }].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-blue-50 rounded-2xl p-5">
                <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-white" /></div>
                <div className="font-bold text-gray-900 text-sm mb-1">{title}</div>
                <div className="text-gray-500 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-blue-600 font-semibold text-sm mb-3 uppercase tracking-wider">Our Programs</div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Popular Courses</h2>
            <p className="text-gray-500 max-w-xl mx-auto">UGC-approved distance and online programs from top universities</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map(({ name, desc, duration, mode }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-800"><GraduationCap className="w-6 h-6 text-white" /></div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
                <p className="text-gray-500 text-sm mb-4">{desc}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{mode}</span>
                </div>
                <a href="#contact" className="flex items-center gap-1 text-blue-700 font-semibold text-sm">Enquire Now <ChevronRight className="w-4 h-4" /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-yellow-400 font-semibold text-sm mb-3 uppercase tracking-wider">How It Works</div>
            <h2 className="text-3xl font-black text-white mb-4">Simple 4-Step Process</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map(({ step, title, desc }) => (
              <div key={step} className="bg-blue-800/50 border border-blue-700 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-blue-900 font-black text-lg">{step}</span></div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-blue-200 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-blue-600 font-semibold text-sm mb-3 uppercase tracking-wider">Student Stories</div>
            <h2 className="text-3xl font-black text-gray-900">What Our Students Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, course, text }) => (
              <div key={name} className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center"><span className="text-white font-bold text-sm">{name[0]}</span></div>
                  <div><div className="font-bold text-gray-900 text-sm">{name}</div><div className="text-gray-500 text-xs">{course}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">
          <div>
            <div className="text-blue-600 font-semibold text-sm mb-3 uppercase tracking-wider">Contact Us</div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-gray-600 mb-8">Our counselors are ready to help you choose the right path.</p>
            <div className="space-y-4">
              {[
                { icon: Phone, label: 'Helpline', value: '+91 72059 70889 | +91 94374 87211' },
                { icon: Mail, label: 'Email', value: 'admin@eduprime.in' },
                { icon: Clock, label: 'Office Hours', value: 'Mon – Sat: 9:00 AM – 6:00 PM' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-blue-700" /></div>
                  <div><div className="text-xs text-gray-500">{label}</div><div className="font-semibold text-gray-900 text-sm">{value}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <input placeholder="Your Name *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              <input placeholder="Phone Number *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              <input placeholder="Email Address" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              <textarea placeholder="Your Message" rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              <button className="w-full py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 text-sm">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center"><span className="text-white font-black text-xs">EP</span></div>
                <span className="text-white font-bold">EduPrime</span>
              </div>
              <p className="text-sm leading-relaxed">India's trusted education consulting platform since 2010.</p>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Quick Links</div>
              <div className="space-y-2 text-sm">
                {[['#home', 'Home'], ['#courses', 'Courses'], ['#services', 'About Us'], ['#contact', 'Contact']].map(([href, label]) => (
                  <a key={label} href={href} className="block hover:text-white">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Programs</div>
              <div className="space-y-2 text-sm">
                {COURSES.map(c => <a key={c.name} href="#courses" className="block hover:text-white">{c.name}</a>)}
              </div>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Portal Access</div>
              <div className="space-y-2 text-sm">
                <Link href="/auth/login" className="block hover:text-white">Student Login</Link>
                <Link href="/auth/register" className="block hover:text-white">Student Register</Link>
                <Link href="/auth/login" className="block hover:text-white">Staff Login</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2025 EduPrime. All rights reserved.</p>
            <div className="flex gap-4"><a href="#" className="hover:text-white">Privacy Policy</a><a href="#" className="hover:text-white">Terms</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
