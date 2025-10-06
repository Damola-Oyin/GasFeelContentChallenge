'use client'

import { useState, useMemo } from 'react';

interface Submission {
  id: string;
  contestant_id: string;
  submission_url: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  points_awarded: number | null;
  admin_notes: string | null;
  contestant: {
    external_id: string;
    first_name: string;
  };
}

interface Contest {
  id: string;
  end_at: string;
  status: string;
}

interface AdminSubmissionsTableProps {
  submissions: Submission[];
  contest: Contest | null;
  onUpdate: () => void;
}

export default function AdminSubmissionsTable({ 
  submissions, 
  contest, 
  onUpdate 
}: AdminSubmissionsTableProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject'>('approve');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredSubmissions = useMemo(() => {
    if (filter === 'all') return submissions;
    return submissions.filter(sub => sub.status === filter);
  }, [submissions, filter]);

  const isLateSubmission = (submittedAt: string) => {
    if (!contest) return false;
    return new Date(submittedAt) > new Date(contest.end_at);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubmissions.map(sub => sub.id));
    }
  };

  const handleSelectSubmission = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0) return;
    
    setLoading('bulk');
    setError(null);
    
    try {
      const response = await fetch('/api/admin/submissions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionIds: selectedIds,
          action: bulkAction,
          points: bulkAction === 'approve' ? 10 : 0
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update submissions');
      }
      
      setSelectedIds([]);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submissions');
    } finally {
      setLoading(null);
    }
  };

  const handleSingleAction = async (submissionId: string, action: 'approve' | 'reject') => {
    setLoading(submissionId);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/submissions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          action,
          points: action === 'approve' ? 10 : 0
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} submission`);
      }
      
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} submission`);
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (isLate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Late
        </span>
      );
    }
    
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Filters and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-cobalt text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-cobalt text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({submissions.filter(s => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'approved' 
                ? 'bg-cobalt text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({submissions.filter(s => s.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'rejected' 
                ? 'bg-cobalt text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({submissions.filter(s => s.status === 'rejected').length})
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as 'approve' | 'reject')}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="approve">Approve Selected</option>
              <option value="reject">Reject Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={loading === 'bulk'}
              className="pill-button-primary text-sm disabled:opacity-50"
            >
              {loading === 'bulk' ? 'Processing...' : `Apply to ${selectedIds.length} submissions`}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={filteredSubmissions.length > 0 && selectedIds.length === filteredSubmissions.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-cobalt focus:ring-cobalt border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contestant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubmissions.map((submission) => {
              const isLate = isLateSubmission(submission.submitted_at);
              const isSelected = selectedIds.includes(submission.id);
              const isProcessing = loading === submission.id;
              
              return (
                <tr 
                  key={submission.id} 
                  className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} ${
                    isLate ? 'opacity-75' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectSubmission(submission.id)}
                      className="h-4 w-4 text-cobalt focus:ring-cobalt border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.contestant.external_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.contestant.first_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={submission.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cobalt hover:text-cobalt/80 truncate block max-w-xs"
                    >
                      {submission.submission_url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(submission.submitted_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission.status, isLate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.points_awarded || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSingleAction(submission.id, 'approve')}
                        disabled={isProcessing || submission.status === 'approved'}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleSingleAction(submission.id, 'reject')}
                        disabled={isProcessing || submission.status === 'rejected'}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No submissions found for the selected filter.</p>
        </div>
      )}
    </div>
  );
}

