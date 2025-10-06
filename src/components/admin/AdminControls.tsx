'use client'

import { useState } from 'react';

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
  const isContestEnded = new Date() > new Date(contest.end_at);
  const canPublishFinal = contest.status === 'live' && isContestEnded;

  return (
    <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-6">
      <h3 className="text-lg font-semibold text-charcoal mb-4">Contest Controls</h3>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Freeze/Unfreeze Display */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-charcoal">
            Public Display
          </label>
          <button
            onClick={handleFreezeToggle}
            disabled={loading === 'freeze'}
            className={`w-full pill-button ${
              contest.freeze_public_display 
                ? 'pill-button-secondary' 
                : 'pill-button-primary'
            } disabled:opacity-50`}
          >
            {loading === 'freeze' 
              ? 'Updating...' 
              : contest.freeze_public_display 
                ? 'Unfreeze Display' 
                : 'Freeze Display'
            }
          </button>
          <p className="text-xs text-gray-500">
            {contest.freeze_public_display 
              ? 'Leaderboard is frozen' 
              : 'Leaderboard is live'
            }
          </p>
        </div>

        {/* Status Controls */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-charcoal">
            Contest Status
          </label>
          <div className="space-y-1">
            {!isContestLive && (
              <button
                onClick={() => handleStatusChange('live')}
                disabled={loading === 'status'}
                className="w-full pill-button-secondary text-sm disabled:opacity-50"
              >
                Set to Live
              </button>
            )}
            {isContestLive && (
              <button
                onClick={() => handleStatusChange('verification')}
                disabled={loading === 'status'}
                className="w-full pill-button-secondary text-sm disabled:opacity-50"
              >
                Set to Verification
              </button>
            )}
            {contest.status === 'verification' && (
              <button
                onClick={() => handleStatusChange('final')}
                disabled={loading === 'status'}
                className="w-full pill-button-secondary text-sm disabled:opacity-50"
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
          <label className="block text-sm font-medium text-charcoal">
            Final Results
          </label>
          <button
            onClick={handlePublishFinal}
            disabled={loading === 'publish' || !canPublishFinal}
            className={`w-full pill-button ${
              canPublishFinal ? 'pill-button-primary' : 'pill-button-secondary'
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
          <label className="block text-sm font-medium text-charcoal">
            Contest Info
          </label>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Ends:</span>
              <span className="font-medium">
                {new Date(contest.end_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {new Date(contest.end_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ended:</span>
              <span className={`font-medium ${isContestEnded ? 'text-red-600' : 'text-green-600'}`}>
                {isContestEnded ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Freezing display prevents public leaderboard updates</li>
          <li>• Publishing final results cannot be undone</li>
          <li>• All actions are logged for audit purposes</li>
          <li>• Contest status affects submission eligibility</li>
        </ul>
      </div>
    </div>
  );
}

