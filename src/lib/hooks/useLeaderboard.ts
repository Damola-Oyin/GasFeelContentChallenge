import { useState, useEffect } from 'react'
import { LeaderboardEntry, ContestantSearchResult } from '@/lib/database.types'

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leaderboard')
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      
      const result = await response.json()
      setLeaderboard(result.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  return { leaderboard, loading, error, refetch: fetchLeaderboard }
}

export function useContestantSearch() {
  const [searchResult, setSearchResult] = useState<ContestantSearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchContestant = async (contestantId: string) => {
    if (!contestantId.trim()) {
      setSearchResult(null)
      return
    }

    try {
      setSearching(true)
      setSearchError(null)
      
      const response = await fetch(`/api/leaderboard/search?id=${encodeURIComponent(contestantId)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setSearchError('Contestant not found')
        } else {
          setSearchError('Failed to search contestant')
        }
        setSearchResult(null)
        return
      }
      
      const result = await response.json()
      setSearchResult(result.data)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Unknown error')
      setSearchResult(null)
    } finally {
      setSearching(false)
    }
  }

  return { searchResult, searching, searchError, searchContestant }
}

