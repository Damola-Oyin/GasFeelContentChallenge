'use client'

import { useState, useEffect } from 'react';

interface Contestant {
  external_id: string;
  current_points: number;
}

interface AddPointsFormProps {
  contestStatus: any;
  onSuccess: () => void;
}

export default function AddPointsForm({ contestStatus, onSuccess }: AddPointsFormProps) {
  const [contestantId, setContestantId] = useState('');
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Check if contest is active
  const isContestActive = contestStatus?.status === 'live' && 
    new Date() < new Date(contestStatus?.end_at);

  // Validate contestant ID format
  const isValidFormat = contestantId.length >= 5; // Allow any ID with at least 5 characters

  // Debounced validation
  useEffect(() => {
    if (!isValidFormat || !contestantId.trim()) {
      setContestant(null);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      validateContestant(contestantId.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [contestantId, isValidFormat]);

  const validateContestant = async (id: string) => {
    try {
      setValidating(true);
      setError(null);
      
      const response = await fetch(`/api/contestants/validate?id=${encodeURIComponent(id)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Contestant ID not found. Please check and try again.');
        } else {
          setError('Failed to validate contestant ID.');
        }
        setContestant(null);
        return;
      }
      
      const data = await response.json();
      setContestant(data);
    } catch (err) {
      setError('Error validating contestant ID.');
      setContestant(null);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!contestant || !isValidFormat) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/csr/add-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestant_id: contestantId.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add points');
      }

      const result = await response.json();
      setSuccess(`10 points added to ${contestantId} successfully!`);
      setContestantId('');
      setContestant(null);
      setShowConfirmDialog(false);
      
      // Call success callback to refresh contest status
      onSuccess();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add points');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const nextPoints = contestant ? contestant.current_points + 10 : 0;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="glass-card backdrop-blur-md bg-green-50 border border-green-200 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="glass-card backdrop-blur-md bg-red-50 border border-red-200 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Contestant ID Input */}
      <div>
        <label htmlFor="contestant-id" className="block text-sm font-medium text-charcoal mb-2">
          Contestant ID
        </label>
        <div className="relative">
          <input
            id="contestant-id"
            type="text"
            value={contestantId}
            onChange={(e) => setContestantId(e.target.value.toUpperCase())}
            placeholder="Enter ID (e.g., JohnA1B2)"
            disabled={!isContestActive}
            className="w-full px-4 py-3 rounded-lg border border-white/80 bg-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-golden focus:border-transparent text-charcoal placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {validating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cobalt"></div>
            </div>
          )}
        </div>
        {!isContestActive && (
          <p className="text-sm text-red-600 mt-2">
            Challenge deadline passed. Point additions are disabled.
          </p>
        )}
      </div>

      {/* Fixed Points Display */}
      <div className="glass-card backdrop-blur-md bg-white/40 border border-white/60 shadow-sm p-4">
        <div className="text-center">
          <span className="text-charcoal font-medium">Add </span>
          <span className="text-xl font-bold text-cobalt">10 points</span>
          <span className="text-charcoal font-medium"> (fixed amount)</span>
        </div>
      </div>

      {/* Preview */}
      {contestant && (
        <div className="glass-card backdrop-blur-md bg-white/40 border border-white/60 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Preview</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Contestant ID:</p>
              <p className="font-medium text-charcoal">{contestant.external_id}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Current Points:</p>
              <p className="text-lg font-bold text-charcoal">{contestant.current_points}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">→</span>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Next Points:</p>
              <p className="text-lg font-bold text-cobalt">{nextPoints}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Points Button */}
      <button
        onClick={handleConfirm}
        disabled={!contestant || !isValidFormat || loading || !isContestActive}
        className="w-full pill-button-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-charcoal"></div>
            <span>Adding Points...</span>
          </div>
        ) : (
          'Add Points'
        )}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card backdrop-blur-md bg-white/90 border border-white/90 shadow-xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-tangerine/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-tangerine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">Confirm Action</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to add 10 points to <strong>{contestantId}</strong>?
                <br />
                <span className="text-tangerine font-medium">This action cannot be undone.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 pill-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 pill-button-primary"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
