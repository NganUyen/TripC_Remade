/**
 * Clerk Authentication Helper
 * 
 * This module provides server-side authentication utilities using Clerk.
 * Used to verify and extract user information from authenticated requests.
 * 
 * @module lib/flight/clerkAuth
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

/**
 * Authenticated user information
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

/**
 * Verify Clerk authentication for API routes
 * 
 * This function checks if the current request is authenticated via Clerk.
 * If authenticated, returns user information. If not, throws an error.
 * 
 * @throws {Error} If user is not authenticated
 * @returns {Promise<AuthenticatedUser>} Authenticated user information
 * 
 * @example
 * ```typescript
 * // In API route
 * export async function POST(request: Request) {
 *   try {
 *     const user = await verifyClerkAuth();
 *     // User is authenticated, proceed with logic
 *   } catch (error) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 * }
 * ```
 */
export async function verifyClerkAuth(): Promise<AuthenticatedUser> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: No valid session found');
  }

  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl
  };
}

/**
 * Get current authenticated user (returns null if not authenticated)
 * 
 * Use this when you want to check authentication without throwing errors.
 * Useful for optional authentication scenarios.
 * 
 * @returns {Promise<AuthenticatedUser | null>} User info or null
 * 
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (user) {
 *   // User is logged in
 * } else {
 *   // User is not logged in
 * }
 * ```
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    return await verifyClerkAuth();
  } catch {
    return null;
  }
}

/**
 * Extract user ID from authenticated request
 * 
 * @returns {Promise<string>} User ID
 * @throws {Error} If not authenticated
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  return userId;
}

/**
 * Check if current request is authenticated
 * 
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}
