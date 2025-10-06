'use client'

import { useState, useEffect, useRef } from 'react';
import { useLeaderboard, useContestantSearch } from '@/lib/hooks/useLeaderboard';
import { useSSE } from '@/lib/hooks/useSSE';
import { LeaderboardEntry } from '@/lib/database.types';

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedContestant, setHighlightedContestant] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const highlightedRef = useRef<HTMLDivElement>(null);
  
  const { leaderboard, loading, error } = useLeaderboard();
  const { searchResult, searching, searchError, searchContestant } = useContestantSearch();
  
  // Use SSE for real-time updates
  const { data: sseData, connected } = useSSE('/api/sse');
  
  // Update leaderboard when SSE data arrives
  useEffect(() => {
    if (sseData?.type === 'leaderboard_update') {
      setLastUpdated(new Date(sseData.timestamp).toLocaleTimeString());
    }
  }, [sseData]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      searchContestant(value.trim());
    }
  };

  // Auto-scroll to highlighted contestant
  useEffect(() => {
    if (highlightedContestant && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedContestant(null);
      }, 3000);
    }
  }, [highlightedContestant]);

  // Handle search result highlighting
  useEffect(() => {
    if (searchResult && searchResult.is_in_top_100) {
      setHighlightedContestant(searchResult.external_id);
    }
  }, [searchResult]);

  const topThree = leaderboard.slice(0, 3);
  const top100 = leaderboard.slice(0, 100);

  if (loading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-snow to-cobalt/10 flex items-center justify-center">
        <div className="glass-card backdrop-blur-md bg-white/60 border border-white/80 shadow-sm p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cobalt mx-auto mb-4"></div>
            <p className="text-charcoal">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-snow to-cobalt/10 flex items-center justify-center">
        <div className="glass-card backdrop-blur-md bg-white/60 border border-white/80 shadow-sm p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading leaderboard: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="pill-button-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-snow to-lavender/30">
      {/* Header */}
      <header className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="py-3 sm:py-4">
            {/* Title */}
            <div className="text-center mb-4 sm:mb-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-charcoal">
                GasFeel Content Challenge
              </h1>
            </div>
            
            {/* Search and Join Button */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your ID (e.g., JohnA1B2)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-full border-2 border-gray-300 bg-gray-50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-golden focus:border-cobalt text-charcoal placeholder-gray-600 shadow-md hover:border-gray-400 transition-colors text-sm sm:text-base"
                />
                {searching && (
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-cobalt"></div>
                  </div>
                )}
              </div>
              <a
                href="https://wa.me/2347076338967?text=%23Challenge"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cobalt to-cobalt/80 text-white rounded-full font-semibold hover:from-cobalt/90 hover:to-cobalt/70 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse hover:animate-none text-sm sm:text-base"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Join The Challenge
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Countdown Timer */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-3 sm:p-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="text-charcoal font-medium text-sm sm:text-base">Ends in</span>
            <div className="flex gap-1 sm:gap-2">
              <div className="pill-button-secondary text-center min-w-[50px] sm:min-w-[60px]">
                <div className="text-sm sm:text-lg font-bold text-charcoal">15</div>
                <div className="text-xs text-gray-600">DAYS</div>
              </div>
              <div className="pill-button-secondary text-center min-w-[50px] sm:min-w-[60px]">
                <div className="text-sm sm:text-lg font-bold text-charcoal">05</div>
                <div className="text-xs text-gray-600">HRS</div>
              </div>
              <div className="pill-button-secondary text-center min-w-[50px] sm:min-w-[60px]">
                <div className="text-sm sm:text-lg font-bold text-charcoal">30</div>
                <div className="text-xs text-gray-600">MIN</div>
              </div>
              <div className="pill-button-secondary text-center min-w-[50px] sm:min-w-[60px]">
                <div className="text-sm sm:text-lg font-bold text-charcoal">15</div>
                <div className="text-xs text-gray-600">SEC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Rank Card (for contestants not in top 100) */}
        {searchResult && !searchResult.is_in_top_100 && searchResult.neighbors && (
          <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-charcoal mb-3 sm:mb-4 text-center">Your Rank</h2>
            <div className="space-y-2">
              {searchResult.neighbors.map((neighbor) => (
                <div
                  key={neighbor.external_id}
                  className={`flex items-center justify-between p-2 sm:p-3 glass-card backdrop-blur-md border shadow-sm rounded-lg transition-all ${
                    neighbor.external_id === searchResult.external_id
                      ? 'bg-golden/20 border-golden'
                      : 'bg-white/40 border-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-cobalt/10 flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-medium text-cobalt">#{neighbor.rank}</span>
                    </div>
                    <span className="font-medium text-charcoal text-sm sm:text-base truncate">{neighbor.external_id}</span>
                  </div>
                  <span className="font-bold text-charcoal text-sm sm:text-base">{neighbor.current_points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top-3 Podium */}
        {topThree.length > 0 && (
          <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-charcoal mb-4 sm:mb-6 text-center">Top 3</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {topThree.map((contestant, index) => (
                <div
                  key={contestant.external_id}
                  className={`glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-4 sm:p-6 text-center min-h-[140px] sm:min-h-[180px] flex flex-col justify-between ${
                    index === 0 ? 'sm:order-2' : index === 1 ? 'sm:order-1' : 'sm:order-3'
                  } ${index === 0 ? 'scale-105' : 'scale-100'}`}
                >
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-golden flex items-center justify-center shadow-md">
                      <svg className="w-4 sm:w-6 h-4 sm:h-6 text-charcoal" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-charcoal mb-1 sm:mb-2">#{contestant.rank}</div>
                  <div className="text-xs sm:text-sm font-medium text-charcoal mb-2 sm:mb-3 truncate">{contestant.external_id}</div>
                  <div className="text-xl sm:text-2xl font-bold text-cobalt">{contestant.current_points}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top-100 List */}
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-charcoal mb-3 sm:mb-4">Leaderboard</h2>
            <div className="space-y-1 sm:space-y-2">
              {top100.map((contestant) => (
                <div
                  key={contestant.external_id}
                  ref={contestant.external_id === highlightedContestant ? highlightedRef : null}
                  className={`flex items-center justify-between p-2 sm:p-3 glass-card backdrop-blur-md border shadow-sm rounded-lg transition-all ${
                    contestant.external_id === highlightedContestant
                      ? 'bg-golden/20 border-golden animate-pulse'
                      : 'bg-white/40 border-white/60 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-cobalt/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-medium text-cobalt">#{contestant.rank}</span>
                    </div>
                    <span className="font-medium text-charcoal text-sm sm:text-base truncate">{contestant.external_id}</span>
                  </div>
                  <span className="font-bold text-charcoal text-sm sm:text-base flex-shrink-0 ml-2">{contestant.current_points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Last Updated Indicator */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            {lastUpdated ? `Last updated ${lastUpdated}` : 'Loading...'}
            {connected && <span className="ml-2 text-green-600">● Live</span>}
          </span>
        </div>
      </main>
    </div>
  );
}
