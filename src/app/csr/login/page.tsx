'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CSRLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && (data.role === 'csr' || data.role === 'admin')) {
        // Store auth token in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_email', data.email);
        
        // Redirect to CSR portal
        router.push('/csr');
      } else {
        setError('Invalid CSR credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-snow to-lavender/30 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal mb-2">CSR Portal Access</h1>
          <p className="text-gray-600 text-sm sm:text-base">Sign in to access the CSR dashboard</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-4 sm:mb-6" role="alert">
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
              CSR Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-charcoal placeholder-gray-600 text-sm sm:text-base"
              placeholder="csr@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-charcoal placeholder-gray-600 text-sm sm:text-base"
              placeholder="Enter your CSR password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? 'Signing In...' : 'Access CSR Portal'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <button 
            onClick={() => router.push('/')} 
            className="text-cobalt hover:text-cobalt/80 transition-colors text-xs sm:text-sm"
          >
            ← Back to Leaderboard
          </button>
        </div>

        <div className="mt-4 sm:mt-6 text-xs text-gray-500 text-center">
          <p>Access restricted to authorized CSR and Admin accounts only.</p>
          <p>Contact your administrator if you need access.</p>
        </div>
      </div>
    </div>
  );
}
