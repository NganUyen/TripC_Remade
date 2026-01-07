// Utility functions for API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}

export const api = {
  get: (endpoint: string) => fetchAPI(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => 
    fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => 
    fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => 
    fetchAPI(endpoint, { method: 'DELETE' }),
}
