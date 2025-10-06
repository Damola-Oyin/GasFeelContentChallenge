'use client'

import { useState, useEffect } from 'react';
import AddPointsForm from '@/components/csr/AddPointsForm';
import ContestStatus from '@/components/common/ContestStatus';

export default function CSRDemoPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-snow to-lavender/30">
      {/* Header */}
      <header className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">
                CSR Add Points (DEMO)
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
              <a 
                href="/csr" 
                className="pill-button-secondary text-sm"
              >
                CSR Portal
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
              Enter a contestant ID to add 10 points. This action cannot be undone.
            </p>
          </div>
          
          <AddPointsForm 
            contestStatus={contestStatus}
            onSuccess={fetchContestStatus}
          />
        </div>

        {/* Instructions */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Test Instructions</h3>
          <div className="space-y-2 text-gray-600">
            <p><strong>1.</strong> Try entering: <code className="bg-gray-100 px-2 py-1 rounded">GF-AB12CD</code></p>
            <p><strong>2.</strong> The form should validate and show current points</p>
            <p><strong>3.</strong> Click "Add Points" to test the confirmation dialog</p>
            <p><strong>4.</strong> Confirm to add 10 points to the contestant</p>
          </div>
        </div>
      </main>
    </div>
  );
}

