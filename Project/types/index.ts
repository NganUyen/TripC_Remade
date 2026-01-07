// Global types and interfaces

export interface Trip {
  id: string
  title: string
  description: string
  destination: string
  startDate: Date
  endDate: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
