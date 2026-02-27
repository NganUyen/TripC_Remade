/**
 * Clerk Authentication Helper for Partner Portals
 *
 * Verifies the Clerk JWT, resolves the Clerk user ID, then looks up
 * the corresponding partner record from Supabase.
 *
 * Setup required:
 *   - partner_users.clerk_user_id  (hotel portal)
 *   - flight_partner_users.clerk_user_id  (flight portal)
 * See migration: 20260227_partner_clerk_auth.sql
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// ─────────────────────────────────────────────────────────────
// HOTEL PARTNER AUTH
// ─────────────────────────────────────────────────────────────

/**
 * Verify Clerk session and resolve the hotel partner ID.
 * Returns the `hotel_partners.id` UUID belonging to this Clerk user.
 *
 * @throws 401 – not signed in
 * @throws 403 – signed in but not a hotel partner
 */
export async function resolveHotelPartnerId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw Object.assign(new Error("Unauthorized: no active session"), {
      status: 401,
    });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("partner_users")
    .select("partner_id")
    .eq("clerk_user_id", userId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw Object.assign(
      new Error("Forbidden: not a registered hotel partner"),
      { status: 403 },
    );
  }

  return data.partner_id as string;
}

// ─────────────────────────────────────────────────────────────
// FLIGHT PARTNER AUTH
// ─────────────────────────────────────────────────────────────

export interface FlightPartnerIdentity {
  /** UUID from flight_partners.id – used by getFlightPartner() */
  partnerId: string;
  /** IATA / internal code stored in flights.airline_code – used by getPartnerFlights() */
  airlineCode: string;
}

/**
 * Verify Clerk session and resolve the flight partner identity.
 * Returns both the UUID partner ID and the airline_code string.
 *
 * @throws 401 – not signed in
 * @throws 403 – signed in but not a flight partner
 */
export async function resolveFlightPartnerId(): Promise<FlightPartnerIdentity> {
  const { userId } = await auth();
  if (!userId) {
    throw Object.assign(new Error("Unauthorized: no active session"), {
      status: 401,
    });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("flight_partner_users")
    .select("partner_id, flight_partners!inner(airline_code)")
    .eq("clerk_user_id", userId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw Object.assign(
      new Error("Forbidden: not a registered flight partner"),
      { status: 403 },
    );
  }

  const fp = data.flight_partners as unknown as { airline_code: string };
  return {
    partnerId: data.partner_id as string,
    airlineCode: fp.airline_code,
  };
}

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Convert an auth error (status 401 / 403) to a NextResponse-ready status code.
 * Falls back to 500 for unexpected errors.
 */
export function authErrorStatus(err: unknown): 401 | 403 | 500 {
  if (err && typeof err === "object" && "status" in err) {
    const s = (err as { status: number }).status;
    if (s === 401 || s === 403) return s;
  }
  return 500;
}
