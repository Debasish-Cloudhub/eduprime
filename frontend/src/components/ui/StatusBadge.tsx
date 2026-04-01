import clsx from 'clsx';

const statusConfig: Record<string, { label: string; className: string }> = {
  NEW:            { label: 'New',            className: 'bg-gray-100 text-gray-700' },
  INITIATED:      { label: 'Initiated',      className: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS:    { label: 'In Progress',    className: 'bg-indigo-100 text-indigo-700' },
  DOCS_SUBMITTED: { label: 'Docs Submitted', className: 'bg-purple-100 text-purple-700' },
  OFFER_RECEIVED: { label: 'Offer Received', className: 'bg-orange-100 text-orange-700' },
  ENROLLED:       { label: 'Enrolled',       className: 'bg-cyan-100 text-cyan-700' },
  WON:            { label: 'Won ✓',          className: 'bg-green-100 text-green-700' },
  LOST:           { label: 'Lost',           className: 'bg-red-100 text-red-700' },
  DROPPED:        { label: 'Dropped',        className: 'bg-gray-100 text-gray-500' },
  // SLA
  ON_TRACK:       { label: 'On Track',       className: 'bg-green-100 text-green-700' },
  AT_RISK:        { label: 'At Risk',        className: 'bg-amber-100 text-amber-700' },
  BREACHED:       { label: 'Breached',       className: 'bg-red-100 text-red-700' },
  // Expense
  PENDING:        { label: 'Pending',        className: 'bg-amber-100 text-amber-700' },
  APPROVED:       { label: 'Approved',       className: 'bg-green-100 text-green-700' },
  REJECTED:       { label: 'Rejected',       className: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
