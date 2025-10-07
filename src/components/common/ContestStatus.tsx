'use client'

import { useState, useEffect } from 'react';

interface ContestStatusProps {
  contest: any;
}

export default function ContestStatus({ contest }: ContestStatusProps) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPastDeadline, setIsPastDeadline] = useState(false);

  // Calculate countdown - same logic as homepage (14 days from tomorrow)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const contestEnd = new Date(tomorrow);
      contestEnd.setDate(tomorrow.getDate() + 14);
      contestEnd.setHours(23, 59, 59, 999);
      
      const timeDiff = contestEnd.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
        setIsPastDeadline(false);
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsPastDeadline(true);
      }
    };

    calculateCountdown();
    
    // Don't update countdown if display is frozen (for admin/CSR pages)
    const shouldUpdate = !contest?.freeze_public_display;
    const interval = shouldUpdate ? setInterval(calculateCountdown, 1000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [contest?.freeze_public_display]);

  if (!contest) return null;

  const isLive = contest.status === 'live';
  const isVerification = contest.status === 'verification';
  const isFinal = contest.status === 'final';
  const isFrozen = contest.freeze_public_display;

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
    <div className={`glass-card backdrop-blur-md border shadow-sm p-3 sm:p-4 mb-6 ${statusColor}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="font-medium text-sm sm:text-base">{statusText}</span>
        </div>
        {isLive && !isPastDeadline && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">
              {isFrozen ? '🔒 Frozen at:' : 'Time remaining:'}
            </span>
            <div className="flex gap-1">
              <div className={`px-2 py-1 rounded text-xs sm:text-sm font-bold ${isFrozen ? 'bg-gray-300 text-gray-700' : 'bg-white/50'}`}>
                {countdown.days}d
              </div>
              <div className={`px-2 py-1 rounded text-xs sm:text-sm font-bold ${isFrozen ? 'bg-gray-300 text-gray-700' : 'bg-white/50'}`}>
                {countdown.hours}h
              </div>
              <div className={`px-2 py-1 rounded text-xs sm:text-sm font-bold ${isFrozen ? 'bg-gray-300 text-gray-700' : 'bg-white/50'}`}>
                {countdown.minutes}m
              </div>
              <div className={`px-2 py-1 rounded text-xs sm:text-sm font-bold ${isFrozen ? 'bg-gray-300 text-gray-700' : 'bg-white/50'}`}>
                {countdown.seconds}s
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

