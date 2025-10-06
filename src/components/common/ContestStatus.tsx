'use client'

interface ContestStatusProps {
  contest: any;
}

export default function ContestStatus({ contest }: ContestStatusProps) {
  if (!contest) return null;

  const isLive = contest.status === 'live';
  const isVerification = contest.status === 'verification';
  const isFinal = contest.status === 'final';
  const isPastDeadline = new Date() > new Date(contest.end_at);

  let statusColor = 'bg-blue-50 border-blue-200 text-blue-800';
  let statusText = 'Contest Active';
  let statusIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  if (isVerification) {
    statusColor = 'bg-yellow-50 border-yellow-200 text-yellow-800';
    statusText = 'Contest ended — results pending verification';
    statusIcon = (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  } else if (isFinal) {
    statusColor = 'bg-green-50 border-green-200 text-green-800';
    statusText = 'Final Results Published';
    statusIcon = (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  } else if (isPastDeadline) {
    statusColor = 'bg-red-50 border-red-200 text-red-800';
    statusText = 'Contest ended — deadline passed';
    statusIcon = (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }

  return (
    <div className={`glass-card backdrop-blur-md border shadow-sm p-4 mb-6 ${statusColor}`}>
      <div className="flex items-center gap-2">
        {statusIcon}
        <span className="font-medium">{statusText}</span>
      </div>
      {isLive && (
        <div className="mt-2 text-sm">
          <span>Ends: </span>
          <span className="font-medium">
            {new Date(contest.end_at).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

