'use client'

import { useState, useEffect } from 'react';
import AdminSubmissionsTable from '@/components/admin/AdminSubmissionsTable';

export default function AdminTestPage() {
  const [contestStatus, setContestStatus] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo purposes
    const mockContest = {
      id: 'contest-123',
      name: 'GasFeel Content Challenge',
      status: 'live',
      freeze_public_display: false,
      end_at: '2024-12-31T23:59:59Z'
    };

    const mockSubmissions = [
      {
        id: 'sub-1',
        contestant_id: 'contestant-1',
        submission_url: 'https://example.com/submission1',
        submitted_at: '2024-01-15T10:30:00Z',
        status: 'pending',
        points_awarded: null,
        admin_notes: null,
        contestant: {
          external_id: 'GF-AB12CD',
          first_name: 'John'
        }
      },
      {
        id: 'sub-2',
        contestant_id: 'contestant-2',
        submission_url: 'https://example.com/submission2',
        submitted_at: '2024-01-15T11:45:00Z',
        status: 'approved',
        points_awarded: 10,
        admin_notes: 'Great submission!',
        contestant: {
          external_id: 'GF-EF34GH',
          first_name: 'Sarah'
        }
      },
      {
        id: 'sub-3',
        contestant_id: 'contestant-3',
        submission_url: 'https://example.com/submission3',
        submitted_at: '2024-01-16T09:15:00Z',
        status: 'rejected',
        points_awarded: 0,
        admin_notes: 'Does not meet requirements',
        contestant: {
          external_id: 'GF-IJ56KL',
          first_name: 'Mike'
        }
      }
    ];

    setContestStatus(mockContest);
    setSubmissions(mockSubmissions);
    setLoading(false);
  }, []);

  const handleSubmissionsUpdate = () => {
    console.log('Submissions updated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-snow to-lavender/30">
      {/* Header */}
      <header className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">
                Admin Approvals Test
              </h1>
              <p className="text-gray-600">GasFeel Content Challenge - Test Mode</p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/csr/demo" 
                className="pill-button-secondary text-sm"
              >
                CSR Demo
              </a>
              <a 
                href="/" 
                className="pill-button-secondary text-sm"
              >
                View Leaderboard
              </a>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                TEST MODE
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contest Status Banner */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-4 mb-8 text-center">
          <p className="text-charcoal font-medium">
            Contest is <span className="text-cobalt">LIVE</span>! 
            Test data loaded - no authentication required.
          </p>
        </div>

        {/* Submissions Table */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-charcoal">
                AI Submissions (Test Data)
              </h2>
              <div className="text-sm text-gray-600">
                {submissions.length} test submissions
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cobalt"></div>
                <span className="ml-2 text-gray-600">Loading submissions...</span>
              </div>
            ) : (
              <AdminSubmissionsTable 
                submissions={submissions}
                contest={contestStatus}
                onUpdate={handleSubmissionsUpdate}
              />
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Test Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-charcoal mb-2">Available Actions</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Filter submissions by status (All, Pending, Approved, Rejected)</li>
                <li>• Select multiple submissions for bulk actions</li>
                <li>• Approve/Reject individual submissions</li>
                <li>• View submission details and contestant info</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2">Test Data</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 1 Pending submission (GF-AB12CD)</li>
                <li>• 1 Approved submission (GF-EF34GH)</li>
                <li>• 1 Rejected submission (GF-IJ56KL)</li>
                <li>• All actions are logged to console</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

