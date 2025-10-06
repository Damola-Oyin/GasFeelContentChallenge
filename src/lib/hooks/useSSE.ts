import { useEffect, useRef, useState } from 'react'

interface SSEUpdate {
  type: string
  timestamp: string
  data: any
  contest?: any
}

export function useSSE(url: string) {
  const [data, setData] = useState<SSEUpdate | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const update: SSEUpdate = JSON.parse(event.data)
        setData(update)
      } catch (err) {
        console.error('Error parsing SSE data:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE error:', err)
      setError(new Error('Connection failed'))
      setConnected(false)
    }

    return () => {
      eventSource.close()
      setConnected(false)
    }
  }, [url])

  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      setConnected(false)
    }
  }

  return { data, error, connected, close }
}

