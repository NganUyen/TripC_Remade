// Application configuration

export const config = {
  app: {
    name: 'TripC',
    description: 'Your intelligent travel planning companion',
    version: '1.0.0',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  features: {
    enableAuth: true,
    enableAnalytics: false,
  },
}
