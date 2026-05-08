'use client';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  GraduationCap, Phone, MessageCircle, CheckCircle,
  Clock, Circle, ChevronRight, BookOpen, Building2, AlertCircle
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'NEW',            label: 'Counseling Initiated',  desc: 'Your enquiry has been received'              },
  { key: 'INITIATED',      label: 'Profile Assessment',    desc: 'Counselor reviewing your profile'            },
  { key: 'IN_PROGRESS',    label: 'College Shortlisting',  desc: 'Identifying best-fit colleges for you'       },
  { key: 'DOCS_SUBMITTED', label: 'Documents Submitted',   desc: 'Documents under verification'                },
  { key: 'OFFER_RECEIVED', label: 'Offer Received',        desc: 'Admission offer letter received'             },
  { key: 'ENROLLED',       label: 'Enrollment In Progress','desc': 'Fee payment and enrollment underway'       },
  { key: 'WON',            label: 'Successfully Enrolled', desc: 'Congratulations! Enrollment complete'        },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

function stepStatus(leadStatus: string, stepKey: string) {
  const leadIdx = STATUS_ORDER.indexOf(leadStatus);
  const stepIdx = STATUS_ORDER.indexOf(stepKey);
  if (leadStatus === 'WON' || stepIdx < leadIdx) return 'complete';
  if (stepIdx === leadIdx) return 'current';
  return 'pending';
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-gray-100 text-gray-700', INITIATED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700', DOCS_SUBMITTED: 'bg-purple-100 text-purple-700',
  OFFER_RECEIVED: 'bg-orange-100 text-orange-700', ENROLLED: 'bg-cyan-100 text-cyan-700',
  WON: 'bg-green-100 text-green-700', LOST: 'bg-red-100 text-red-700',
};

export default function StudentApplicationsPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => leadsApi.getAll({ limit: 20 }).then(r => r.data),
  });

  const leads = data?.data || [];
  const activeLeads = leads.filter((l: any) => l.status !== 'LOST');
  const lostLeads   = leads.filter((l: any) => l.status === 'LOST');

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h2>
      <p className="text-gray-500 mb-8">Track your admission applications and counseling progress</p>

      {/* Counselor CTA */}
      <div className="card bg-gradient-to-r from-brand-600 to-brand-500 text-white mb-8 border-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Speak to Your Counselor</h3>
            <p className="text-blue-100 text-sm mt-0.5">Get expert guidance on your admission journey</p>
          </div>
          <a href="tel:+919000000000"
            className="flex-shrink-0 bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 text-sm">
            Call Now
          </a>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}
        </div>
      )}

      {/* Active Applications */}
      {!isLoading && activeLeads.length > 0 && (
        <div className="space-y-6">
          {activeLeads.map((lead: any) => (
            <div key={lead.id} className="card border border-gray-100 shadow-sm">
              {/* Lead header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                      {lead.status?.replace(/_/g,' ')}
                    </span>
                    {lead.slaStatus === 'BREACHED' && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} /> SLA Breached
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900">Application #{lead.id?.slice(-6).toUpperCase()}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Started {new Date(lead.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
                {lead.agent && (
                  <div className="text-right text-xs text-gray-500">
                    <p className="font-medium text-gray-700">{lead.agent.name}</p>
                    <p>Your Counselor</p>
                  </div>
                )}
              </div>

              {/* Course + College */}
              {(lead.course || lead.college) && (
                <div className="bg-blue-50 rounded-xl p-3 mb-4 flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    {lead.course && <p className="font-semibold text-gray-900 text-sm">{lead.course.name}</p>}
                    {lead.college && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={11} />{lead.college.name}
                      </p>
                    )}
                    {lead.course?.fees && (
                      <p className="text-xs text-blue-700 font-medium mt-1">
                        ₹{Number(lead.course.fees).toLocaleString()} / year
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Progress steps */}
              {lead.status !== 'LOST' && (
                <div className="space-y-3 mb-2">
                  {STATUS_STEPS.map(step => {
                    const s = stepStatus(lead.status, step.key);
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                          ${s === 'complete' ? 'bg-green-100 text-green-600'
                          : s === 'current'  ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-300'
                          : 'bg-gray-100 text-gray-300'}`}>
                          {s === 'complete' ? <CheckCircle size={14}/> : s === 'current' ? <Clock size={14}/> : <Circle size={14}/>}
                        </div>
                        <div className={`flex-1 pb-3 border-b border-gray-50 last:border-0 ${s === 'pending' ? 'opacity-40' : ''}`}>
                          <p className={`text-sm font-medium ${s === 'complete' ? 'text-gray-700' : s === 'current' ? 'text-brand-700' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {s !== 'pending' && <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notes from counselor */}
              {lead.notes && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-medium text-amber-700 mb-1">Note from Counselor</p>
                  <p className="text-sm text-gray-700">{lead.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lost applications */}
      {!isLoading && lostLeads.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Closed Applications</p>
          {lostLeads.map((lead: any) => (
            <div key={lead.id} className="card border border-red-100 opacity-60 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">CLOSED</span>
                  <p className="text-sm font-medium text-gray-700 mt-1">Application #{lead.id?.slice(-6).toUpperCase()}</p>
                </div>
                {lead.course && <p className="text-xs text-gray-500">{lead.course.name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No applications yet */}
      {!isLoading && leads.length === 0 && (
        <div className="card text-center py-14">
          <GraduationCap size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">No Applications Yet</h3>
          <p className="text-gray-400 text-sm mb-6">Browse courses and connect with a counselor to start your journey</p>
          <div className="flex gap-3 justify-center">
            <Link href="/student/courses" className="btn-primary flex items-center gap-2">
              <BookOpen size={16}/> Browse Courses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
