import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({ 
    message: 'TripC API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}
