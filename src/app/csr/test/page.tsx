'use client'

import { useState, useEffect } from 'react';
import AddPointsForm from '@/components/csr/AddPointsForm';
import ContestStatus from '@/components/common/ContestStatus';

export default function CSRTestPage() {
  const [contestStatus, setContestStatus] = useState<any>(null);

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">
                CSR Add Points (TEST PAGE)
              </h1>
              <p className="text-gray-600">GasFeel Content Challenge</p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="pill-button-secondary text-sm"
              >
                View Leaderboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contest Status Banner */}
        <ContestStatus contest={contestStatus} />

        {/* Add Points Form */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              Add Points to Contestant
            </h2>
            <p className="text-gray-600">
              Enter a contestant ID to add 100 points. This action cannot be undone.
            </p>
          </div>
          
          <AddPointsForm 
            contestStatus={contestStatus}
            onSuccess={fetchContestStatus}
          />
        </div>

        {/* Debug Info */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Debug Info</h3>
          <pre className="text-sm text-gray-600 bg-gray-100 p-4 rounded">
            {JSON.stringify(contestStatus, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}

