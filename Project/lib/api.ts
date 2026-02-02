// Utility functions for API calls

// Use relative URL for API calls - works in both local and production
// In production (Vercel), this will use the same domain
// In development, Next.js dev server handles this correctly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      },
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = (body as { error?: string })?.error ?? `API error: ${response.status}`
      throw new Error(message)
    }
    return body
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}

export const api = {
  get: (endpoint: string, init?: RequestInit) =>
    fetchAPI(endpoint, { ...init, method: 'GET' }),
  post: (endpoint: string, data: any, init?: RequestInit) =>
    fetchAPI(endpoint, { ...init, method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any, init?: RequestInit) =>
    fetchAPI(endpoint, { ...init, method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string, init?: RequestInit) =>
    fetchAPI(endpoint, { ...init, method: 'DELETE' }),
}
