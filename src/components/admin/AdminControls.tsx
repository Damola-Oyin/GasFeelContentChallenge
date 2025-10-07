'use client'

import { useState, useEffect } from 'react';

interface Contest {
  id: string;
  name: string;
  status: 'live' | 'verification' | 'final';
  freeze_public_display: boolean;
  end_at: string;
}

interface AdminControlsProps {
  contest: Contest | null;
  onUpdate: () => void;
}

export default function AdminControls({ contest, onUpdate }: AdminControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    const interval = setInterval(calculateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleFreezeToggle = async () => {
    if (!contest) return;
    
    setLoading('freeze');
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/contest/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeze: !contest.freeze_public_display
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update freeze status');
      }
      
      setSuccess(`Leaderboard display ${!contest.freeze_public_display ? 'frozen' : 'unfrozen'}`);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update freeze status');
    } finally {
      setLoading(null);
    }
  };

  const handleStatusChange = async (newStatus: 'live' | 'verification' | 'final') => {
    if (!contest) return;
    
    setLoading('status');
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/contest/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update contest status');
      }
      
      setSuccess(`Contest status updated to ${newStatus}`);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contest status');
    } finally {
      setLoading(null);
    }
  };

  const handlePublishFinal = async () => {
    if (!contest) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to publish final results? This action cannot be undone and will:\n\n' +
      '• Change contest status to "final"\n' +
      '• Unfreeze public display\n' +
      '• Make results publicly available\n\n' +
      'Continue?'
    );
    
    if (!confirmed) return;
    
    setLoading('publish');
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/contest/publish-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to publish final results');
      }
      
      setSuccess('Final results published successfully!');
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish final results');
    } finally {
      setLoading(null);
    }
  };

  if (!contest) {
    return (
      <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-6">
        <div className="text-center text-gray-500">
          Loading contest information...
        </div>
      </div>
    );
  }

  const isContestLive = contest.status === 'live';
  const canPublishFinal = contest.status === 'live' && isPastDeadline;

  return (
    <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-charcoal mb-4">Contest Controls</h3>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Freeze/Unfreeze Display */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-charcoal">
            Public Display
          </label>
          <button
            onClick={handleFreezeToggle}
            disabled={loading === 'freeze'}
            className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-semibold transition-all text-xs sm:text-sm ${
              contest.freeze_public_display 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === 'freeze' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : contest.freeze_public_display ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Unfreeze Display</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Freeze Display</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500">
            {contest.freeze_public_display 
              ? '🔒 Leaderboard is frozen' 
              : '👁️ Leaderboard is live'
            }
          </p>
        </div>

        {/* Status Controls */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-charcoal">
            Contest Status
          </label>
          <div className="space-y-1">
            {!isContestLive && (
              <button
                onClick={() => handleStatusChange('live')}
                disabled={loading === 'status'}
                className="w-full pill-button-secondary text-xs sm:text-sm disabled:opacity-50"
              >
                Set to Live
              </button>
            )}
            {isContestLive && (
              <button
                onClick={() => handleStatusChange('verification')}
                disabled={loading === 'status'}
                className="w-full pill-button-secondary text-xs sm:text-sm disabled:opacity-50"
              >
                Set to Verification
              </button>
            )}
            {contest.status === 'verification' && (
              <button
                onClick={() => handleStatusChange('final')}
                disabled={loading === 'status'}
                className="w-full pill-button-secondary text-xs sm:text-sm disabled:opacity-50"
              >
                Set to Final
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Current: <span className="font-medium capitalize">{contest.status}</span>
          </p>
        </div>

        {/* Publish Final Results */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-charcoal">
            Final Results
          </label>
          <button
            onClick={handlePublishFinal}
            disabled={loading === 'publish' || !canPublishFinal}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-semibold transition-all text-xs sm:text-sm ${
              canPublishFinal 
                ? 'bg-golden text-charcoal hover:bg-golden/90' 
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            } disabled:opacity-50`}
          >
            {loading === 'publish' 
              ? 'Publishing...' 
              : 'Publish Final Results'
            }
          </button>
          <p className="text-xs text-gray-500">
            {canPublishFinal 
              ? 'Ready to publish' 
              : 'Contest must be ended first'
            }
          </p>
        </div>

        {/* Contest Info */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-charcoal">
            Time Remaining
          </label>
          {!isPastDeadline ? (
            <div className="flex flex-wrap gap-1">
              <div className="bg-cobalt/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-center min-w-[45px] sm:min-w-[55px]">
                <div className="text-sm sm:text-base font-bold text-cobalt">{countdown.days}</div>
                <div className="text-xs text-gray-600">Days</div>
              </div>
              <div className="bg-cobalt/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-center min-w-[45px] sm:min-w-[55px]">
                <div className="text-sm sm:text-base font-bold text-cobalt">{countdown.hours}</div>
                <div className="text-xs text-gray-600">Hrs</div>
              </div>
              <div className="bg-cobalt/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-center min-w-[45px] sm:min-w-[55px]">
                <div className="text-sm sm:text-base font-bold text-cobalt">{countdown.minutes}</div>
                <div className="text-xs text-gray-600">Min</div>
              </div>
              <div className="bg-cobalt/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-center min-w-[45px] sm:min-w-[55px]">
                <div className="text-sm sm:text-base font-bold text-cobalt">{countdown.seconds}</div>
                <div className="text-xs text-gray-600">Sec</div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-center">
              <div className="text-sm font-medium text-red-800">Contest Ended</div>
              <div className="text-xs text-red-600">Ready for verification</div>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Status: <span className={`font-medium capitalize ${isContestLive ? 'text-green-600' : 'text-gray-600'}`}>
              {contest.status}
            </span>
          </p>
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Important Notes:</h4>
        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
          <li>• Freezing display prevents public leaderboard updates</li>
          <li>• Publishing final results cannot be undone</li>
          <li>• All actions are logged for audit purposes</li>
          <li>• Contest status affects submission eligibility</li>
        </ul>
      </div>
    </div>
  );
}

