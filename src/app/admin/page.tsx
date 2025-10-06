'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSubmissionsTable from '@/components/admin/AdminSubmissionsTable';
import AdminControls from '@/components/admin/AdminControls';
import ContestStatus from '@/components/common/ContestStatus';

export default function AdminPage() {
  const [contestStatus, setContestStatus] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    router.push('/admin/login');
  };

  useEffect(() => {
    fetchContestStatus();
    fetchSubmissions();
  }, []);

  const fetchContestStatus = async () => {
    try {
      const response = await fetch('/api/contest/status');
      if (response.ok) {
        const data = await response.json();
        setContestStatus(data);
      }
    } catch (error) {
      console.error('Error fetching contest status:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionsUpdate = () => {
    fetchSubmissions();
  };

  const handleContestUpdate = () => {
    fetchContestStatus();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-charcoal">
                  Admin Approvals
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">GasFeel Content Challenge</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <a 
                  href="/csr" 
                  className="pill-button-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  CSR Portal
                </a>
                <a 
                  href="/" 
                  className="pill-button-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  View Leaderboard
                </a>
                <a 
                  href="/admin/manage-users" 
                  className="pill-button-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  Manage Users
                </a>
                <a 
                  href="/admin/manage-credentials" 
                  className="pill-button-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  Manage Credentials
                </a>
                <button 
                  onClick={() => {
                    fetchContestStatus();
                    fetchSubmissions();
                  }} 
                  className="pill-button-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  Refresh
                </button>
                <button
                  onClick={handleLogout}
                  className="pill-button-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Contest Status Banner */}
        <ContestStatus contest={contestStatus} />

        {/* Admin Controls */}
        <div className="mb-6 sm:mb-8">
          <AdminControls 
            contest={contestStatus}
            onUpdate={handleContestUpdate}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card backdrop-blur-md bg-red-50 border border-red-200 shadow-sm p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 text-sm sm:text-base">{error}</span>
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-charcoal">
                AI Submissions
              </h2>
              <div className="text-xs sm:text-sm text-gray-600">
                {submissions.length} total submissions
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-cobalt"></div>
                <span className="ml-2 text-gray-600 text-sm sm:text-base">Loading submissions...</span>
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

        {/* Instructions */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Admin Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-charcoal mb-2">Submission Management</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Filter submissions by status (Pending, Approved, Rejected)</li>
                <li>• Select multiple submissions for bulk actions</li>
                <li>• Review submission details before approving</li>
                <li>• Late submissions are automatically marked as ineligible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2">Contest Controls</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Freeze/Unfreeze public leaderboard display</li>
                <li>• Publish final results when contest ends</li>
                <li>• Monitor contest status and deadlines</li>
                <li>• All actions are logged for audit trail</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
