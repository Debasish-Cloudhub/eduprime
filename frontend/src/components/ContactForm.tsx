'use client';
export default function ContactForm({ courses }: { courses: string[] }) {
  return (
    <form className="space-y-4" onSubmit={e => e.preventDefault()}>
      <input placeholder="Your Name *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      <input placeholder="Phone Number *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      <input placeholder="Email Address" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-500">
        <option value="">Select Course of Interest</option>
        {courses.map(c => <option key={c}>{c}</option>)}
      </select>
      <button type="submit" className="w-full py-3.5 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-lg" className="bg-blue-700">
        Book Free Counselling →
      </button>
    </form>
  );
}
