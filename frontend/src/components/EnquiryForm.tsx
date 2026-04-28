'use client';
import { useState } from 'react';
import { GraduationCap, CheckCircle } from 'lucide-react';

export default function EnquiryForm({ courses }: { courses: string[] }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', course: '' });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" className="bg-blue-700">
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
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            placeholder="Your Full Name *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            placeholder="Contact Number *" type="tel" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            placeholder="Email Address" type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <select value={form.course} onChange={e => setForm({...form, course: e.target.value})}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-500">
            <option value="">Select Course of Interest</option>
            {courses.map(c => <option key={c}>{c}</option>)}
            <option>Other</option>
          </select>
          <button type="submit" className="w-full py-3.5 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-lg" className="bg-blue-700">
            Submit Enquiry →
          </button>
          <p className="text-xs text-gray-400 text-center">Your information is safe with us</p>
        </form>
      )}
    </div>
  );
}
