"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  EventWithSessions,
  EventSearchParams,
  EventListResponse,
  EventTicketTypeWithAvailability
} from '@/lib/events/types'

const API_BASE = '/api/events'

/**
 * Hook to fetch list of events with filters
 * Uses ref-based approach to prevent infinite loops from object prop changes
 */
export function useEvents(params?: EventSearchParams) {
  const [events, setEvents] = useState<EventWithSessions[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use ref to track if we've already fetched with these params
  const lastParamsRef = useRef<string>('')
  const isFetchingRef = useRef(false)

  // Serialize params for comparison
  const paramsString = JSON.stringify({
    city: params?.city ?? '',
    category: params?.category ?? '',
    search: params?.search ?? '',
    limit: params?.limit ?? 20,
    offset: params?.offset ?? 0,
    is_featured: params?.is_featured ?? null,
  })

  useEffect(() => {
    // Skip if params haven't changed or we're already fetching
    if (paramsString === lastParamsRef.current || isFetchingRef.current) {
      return
    }

    const fetchEvents = async () => {
      isFetchingRef.current = true
      lastParamsRef.current = paramsString
      setLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams()
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams.append(key, String(value))
            }
          })
        }

        const response = await fetch(`${API_BASE}?${queryParams.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch events')
        }

        setEvents(data.data || [])
        setTotal(data.pagination?.total || 0)
      } catch (err) {
        console.error('[useEvents] Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
        isFetchingRef.current = false
      }
    }

    fetchEvents()
  }, [paramsString, params])

  const refetch = useCallback(async () => {
    lastParamsRef.current = '' // Reset to force refetch
    setLoading(true)

    try {
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value))
          }
        })
      }

      const response = await fetch(`${API_BASE}?${queryParams.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events')
      }

      setEvents(data.data || [])
      setTotal(data.pagination?.total || 0)
      lastParamsRef.current = paramsString
    } catch (err) {
      console.error('[useEvents] Refetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [params, paramsString])

  return { events, total, loading, error, refetch }
}

/**
 * Hook to fetch a single event by ID or slug
 */
export function useEvent(idOrSlug: string) {
  const [event, setEvent] = useState<EventWithSessions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef<string>('')

  useEffect(() => {
    if (!idOrSlug || idOrSlug === fetchedRef.current) {
      if (!idOrSlug) setLoading(false)
      return
    }

    const fetchEvent = async () => {
      fetchedRef.current = idOrSlug
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE}/${idOrSlug}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch event')
        }

        setEvent(data.data)
      } catch (err) {
        console.error('[useEvent] Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [idOrSlug])

  return { event, loading, error }
}

/**
 * Hook to fetch ticket availability for a session
 */
export function useTicketAvailability(eventId: string, sessionId?: string) {
  const [ticketTypes, setTicketTypes] = useState<EventTicketTypeWithAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchRef = useRef<string>('')

  const fetchKey = `${eventId}-${sessionId || 'all'}`

  useEffect(() => {
    if (!eventId || fetchKey === lastFetchRef.current) return

    const fetchAvailability = async () => {
      lastFetchRef.current = fetchKey
      setLoading(true)
      setError(null)

      try {
        let url = `${API_BASE}/${eventId}/availability`
        if (sessionId) {
          url += `?session_id=${sessionId}`
        }

        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch availability')
        }

        if (sessionId) {
          setTicketTypes(data.data.ticket_types || [])
        } else {
          const allTickets = data.data.sessions?.flatMap(
            (s: any) => s.ticket_types
          ) || []
          setTicketTypes(allTickets)
        }
      } catch (err) {
        console.error('[useTicketAvailability] Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [eventId, sessionId, fetchKey])

  const refetch = useCallback(async () => {
    if (!eventId) return

    lastFetchRef.current = ''
    setLoading(true)
    setError(null)

    try {
      let url = `${API_BASE}/${eventId}/availability`
      if (sessionId) {
        url += `?session_id=${sessionId}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch availability')
      }

      if (sessionId) {
        setTicketTypes(data.data.ticket_types || [])
      } else {
        const allTickets = data.data.sessions?.flatMap(
          (s: any) => s.ticket_types
        ) || []
        setTicketTypes(allTickets)
      }
    } catch (err) {
      console.error('[useTicketAvailability] Refetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [eventId, sessionId])

  return { ticketTypes, loading, error, refetch }
}

/**
 * Format currency for display
 */
export function formatEventPrice(amount: number, currency: string = 'VND'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format event date for display
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/**
 * Format time for display
 */
export function formatEventTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
