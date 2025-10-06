'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddPointsForm from '@/components/csr/AddPointsForm';
import ContestStatus from '@/components/common/ContestStatus';

export default function CSRPage() {
  const [contestStatus, setContestStatus] = useState<any>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    router.push('/csr/login');
  };

  useEffect(() => {
    fetchContestStatus();
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-charcoal">
                  CSR Add Points
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">GasFeel Content Challenge</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <a 
                  href="/" 
                  className="pill-button-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  View Leaderboard
                </a>
                <button 
                  onClick={() => window.location.reload()} 
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

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Contest Status Banner */}
        <ContestStatus contest={contestStatus} />

        {/* Add Points Form */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-6 sm:p-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-charcoal mb-2">
              Add Points to Contestant
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Enter a contestant ID to add 10 points. This action cannot be undone.
            </p>
          </div>
          
          <AddPointsForm 
            contestStatus={contestStatus}
            onSuccess={fetchContestStatus}
          />
        </div>

        {/* Instructions */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-base sm:text-lg font-semibold text-charcoal mb-3 sm:mb-4">Instructions</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-cobalt font-bold text-sm sm:text-base">1.</span>
              <span className="text-sm sm:text-base">Enter the contestant ID in the format GF-XXXXXX (e.g., GF-AB12CD)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cobalt font-bold text-sm sm:text-base">2.</span>
              <span className="text-sm sm:text-base">Review the current and next points in the preview</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cobalt font-bold text-sm sm:text-base">3.</span>
              <span className="text-sm sm:text-base">Click "Add Points" and confirm the action</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cobalt font-bold text-sm sm:text-base">4.</span>
              <span className="text-sm sm:text-base">Points are added immediately and cannot be reversed</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
