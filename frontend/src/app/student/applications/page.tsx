'use client';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, Phone, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentApplicationsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h2>
      <p className="text-gray-500 mb-8">Track your admission applications and counseling status</p>

      {/* CTA to contact counselor */}
      <div className="card bg-gradient-to-r from-brand-600 to-brand-500 text-white mb-8 border-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Start Your Counseling Journey</h3>
            <p className="text-blue-100 text-sm mt-0.5">Our expert counselors will guide you through the admission process</p>
          </div>
          <a href="tel:+919000000000" className="flex-shrink-0 bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
            Call Now
          </a>
        </div>
      </div>

      {/* Process steps */}
      <div className="card mb-8">
        <h3 className="font-semibold text-gray-800 mb-5">Admission Process</h3>
        <div className="space-y-4">
          {[
            { step: 1, label: 'Initial Counseling', desc: 'Discuss your goals and shortlist colleges', status: 'complete' },
            { step: 2, label: 'College Selection', desc: 'Choose the best-fit college and course', status: 'current' },
            { step: 3, label: 'Document Preparation', desc: 'Gather and verify required documents', status: 'pending' },
            { step: 4, label: 'Application Submission', desc: 'Submit applications to selected colleges', status: 'pending' },
            { step: 5, label: 'Offer Letter', desc: 'Receive and review admission offer', status: 'pending' },
            { step: 6, label: 'Enrollment', desc: 'Complete fee payment and enrollment', status: 'pending' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                ${s.status === 'complete' ? 'bg-green-100 text-green-700' : s.status === 'current' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-400'}`}>
                {s.status === 'complete' ? <CheckCircle size={16}/> : s.step}
              </div>
              <div className="flex-1 pb-4 border-b border-gray-50 last:border-0">
                <p className={`font-medium ${s.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No active leads yet */}
      <div className="card text-center py-12">
        <GraduationCap size={48} className="mx-auto text-gray-200 mb-4" />
        <h3 className="font-semibold text-gray-700 mb-2">No Active Applications</h3>
        <p className="text-gray-400 text-sm mb-6">Browse our course catalogue and contact a counselor to start your journey</p>
        <Link href="/student/courses" className="btn-primary inline-flex items-center gap-2">
          <GraduationCap size={16} /> Browse Courses
        </Link>
      </div>
    </div>
  );
}
