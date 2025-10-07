import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { LeaderboardEntry } from '@/lib/database.types'

// Force dynamic rendering for this route (SSE endpoints can't be static)
export const dynamic = 'force-dynamic'

// Store active connections
const connections = new Set<ReadableStreamDefaultController>()

// Function to broadcast updates to all connected clients (internal use only)
function broadcastUpdate(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  
  // Create a copy of the connections set to avoid modification during iteration
  const activeConnections = Array.from(connections)
  
  activeConnections.forEach(controller => {
    try {
      // Double-check if controller is still in the set before enqueuing
      if (connections.has(controller)) {
        controller.enqueue(new TextEncoder().encode(message))
      }
    } catch (error) {
      console.error('Error broadcasting to client:', error)
      // Remove disconnected clients
      connections.delete(controller)
    }
  })
}

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the set
      connections.add(controller)
      
      // Send initial data
      sendLeaderboardUpdate(controller)
      
      // Set up interval to send updates every 2 seconds
      const interval = setInterval(() => {
        // Only send update if connection is still active
        if (connections.has(controller)) {
          sendLeaderboardUpdate(controller)
        } else {
          clearInterval(interval)
        }
      }, 2000)

      // Clean up when connection closes
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        connections.delete(controller)
      })
    },
    
    cancel(controller) {
      connections.delete(controller)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}

async function sendLeaderboardUpdate(controller: ReadableStreamDefaultController) {
  try {
    // Check if controller is still active before proceeding
    if (!connections.has(controller)) {
      return
    }

    // Get the top 100 contestants
    const { data: contestants, error } = await supabaseAdmin
      .from('contestants')
      .select('external_id, current_points, first_reached_current_points_at')
      .order('current_points', { ascending: false })
      .order('first_reached_current_points_at', { ascending: true })
      .limit(100)

    if (error) {
      console.error('Error fetching leaderboard for SSE:', error)
      return
    }

    // Double-check if controller is still active after async operation
    if (!connections.has(controller)) {
      return
    }

    // Add rank to each contestant
    const leaderboardEntries: LeaderboardEntry[] = contestants?.map((contestant, index) => ({
      rank: index + 1,
      external_id: contestant.external_id,
      current_points: contestant.current_points,
      first_reached_current_points_at: contestant.first_reached_current_points_at,
    })) || []

    // Get contest status
    const { data: contest } = await supabaseAdmin
      .from('contest')
      .select('status, end_at, freeze_public_display')
      .single()

    const updateData = {
      type: 'leaderboard_update',
      timestamp: new Date().toISOString(),
      data: leaderboardEntries,
      contest: contest
    }

    const message = `data: ${JSON.stringify(updateData)}\n\n`
    
    // Final check before enqueuing
    if (connections.has(controller)) {
      controller.enqueue(new TextEncoder().encode(message))
    }
  } catch (error) {
    console.error('Error in SSE update:', error)
    // Remove the controller if there's an error
    connections.delete(controller)
  }
}
