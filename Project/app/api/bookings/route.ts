/**
 * Bookings API Endpoint
 * 
 * POST /api/bookings - Create a new hotel booking
 * 
 * Handles the complete booking flow including:
 * - Availability checking
 * - Price calculation
 * - Booking creation
 * - Confirmation code generation
 * - TCent calculation
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// Generate unique confirmation code (format: ABC12345)
function generateConfirmationCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let code = '';
  // 3 letters
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  // 5 numbers
  for (let i = 0; i < 5; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
}

// Check if confirmation code is unique
async function getUniqueConfirmationCode(): Promise<string> {
  let code = generateConfirmationCode();
  let attempts = 0;
  
  while (attempts < 10) {
    const { data } = await supabaseServerClient
      .from('hotel_bookings')
      .select('id')
      .eq('confirmation_code', code)
      .single();
    
    if (!data) {
      return code; // Code is unique
    }
    
    code = generateConfirmationCode();
    attempts++;
  }
  
  throw new Error('Failed to generate unique confirmation code');
}

// Check room availability for date range
async function checkRoomAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const { data, error } = await supabaseServerClient
    .from('hotel_bookings')
    .select('id')
    .eq('room_id', roomId)
    .not('status', 'in', '(cancelled,no_show)')
    .lt('check_in_date', checkOut)
    .gt('check_out_date', checkIn);
  
  if (error) throw error;
  
  return data.length === 0; // Available if no overlapping bookings
}

// Get room rate for date range
async function getRoomRate(
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<{ avgPrice: number; totalPrice: number; nights: number }> {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const { data, error } = await supabaseServerClient
    .from('hotel_rates')
    .select('price_cents, date')
    .eq('room_id', roomId)
    .gte('date', checkIn)
    .lt('date', checkOut)
    .gt('available_rooms', 0);
  
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No rates available for selected dates');
  }
  
  const totalPrice = data.reduce((sum, rate) => sum + rate.price_cents, 0);
  const avgPrice = Math.floor(totalPrice / nights);
  
  return { avgPrice, totalPrice, nights };
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in to make a booking' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      hotel_id,
      room_id,
      partner_id,
      check_in_date,
      check_out_date,
      guest,
      special_requests = '',
      tcent_used = 0,
      working_pass_applied = false
    } = body;

    // Validation
    if (!hotel_id || !room_id || !check_in_date || !check_out_date || !guest) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DATES', message: 'Check-in date must be today or in the future' } },
        { status: 400 }
      );
    }
    
    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DATES', message: 'Check-out date must be after check-in date' } },
        { status: 400 }
      );
    }

    // Check room availability
    const isAvailable = await checkRoomAvailability(room_id, check_in_date, check_out_date);
    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: { code: 'ROOM_NOT_AVAILABLE', message: 'This room is not available for the selected dates' } },
        { status: 409 }
      );
    }

    // Get pricing
    const { avgPrice, totalPrice, nights } = await getRoomRate(room_id, check_in_date, check_out_date);
    
    // Calculate additional charges
    const taxRate = 0.10; // 10% tax
    const serviceFeeRate = 0.05; // 5% service fee
    
    const taxCents = Math.round(totalPrice * taxRate);
    const feesCents = Math.round(totalPrice * serviceFeeRate);
    const tcentDiscountCents = tcent_used * 1; // 1 TCent = 1 cent value
    const workingPassDiscountCents = working_pass_applied ? Math.round(totalPrice * 0.10) : 0;
    
    const grandTotalCents = totalPrice + taxCents + feesCents - tcentDiscountCents - workingPassDiscountCents;
    
    // Calculate TCent earned (5-10% of total)
    const tcentEarnRate = partner_id ? 0.05 : 0.10; // 10% for direct, 5% for partners
    const tcentEarned = Math.round((grandTotalCents / 100) * tcentEarnRate);

    // Fetch user UUID from users table using Clerk ID
    const { data: userData, error: userError } = await supabaseServerClient
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found in database. Please sign out and sign in again.' } },
        { status: 404 }
      );
    }
    
    const userUuid = userData.id;

    // Generate confirmation code
    const confirmationCode = await getUniqueConfirmationCode();
    
    // Get partner commission rate if applicable
    let commissionRate = 0;
    if (partner_id) {
      const { data: partner } = await supabaseServerClient
        .from('hotel_partners')
        .select('commission_rate')
        .eq('id', partner_id)
        .single();
      
      if (partner) {
        commissionRate = partner.commission_rate;
      }
    }
    
    const commissionCents = Math.round(totalPrice * commissionRate);

    // Create booking record
    const { data: booking, error: bookingError } = await supabaseServerClient
      .from('hotel_bookings')
      .insert({
        external_user_ref: user.id,
        user_uuid: userUuid,
        hotel_id,
        room_id,
        partner_id: partner_id || null,
        confirmation_code: confirmationCode,
        check_in_date,
        check_out_date,
        guest_name: guest.name,
        guest_email: guest.email,
        guest_phone: guest.phone,
        guest_count: {
          adults: guest.adults || 2,
          children: guest.children || 0,
          infants: guest.infants || 0
        },
        special_requests,
        total_cents: grandTotalCents,
        nightly_rate_cents: avgPrice,
        tax_cents: taxCents,
        fees_cents: feesCents,
        discount_cents: tcentDiscountCents + workingPassDiscountCents,
        currency: 'USD',
        commission_cents: commissionCents,
        commission_rate: commissionRate,
        tcent_used: tcent_used,
        tcent_earned: tcentEarned,
        tcent_earn_rate: tcentEarnRate,
        working_pass_applied,
        working_pass_discount_cents: workingPassDiscountCents,
        status: 'confirmed', // Auto-confirm for now
        payment_status: 'pending'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      throw bookingError;
    }

    console.log(`[Booking Created] Confirmation: ${confirmationCode}, User: ${user.id}, Hotel: ${hotel_id}`);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        booking_id: booking.id,
        confirmation_code: confirmationCode,
        status: 'confirmed',
        check_in_date,
        check_out_date,
        nights_count: nights,
        total_amount: grandTotalCents / 100,
        currency: 'USD',
        tcent_earned: tcentEarned,
        breakdown: {
          room_total: totalPrice / 100,
          tax: taxCents / 100,
          service_fee: feesCents / 100,
          discounts: (tcentDiscountCents + workingPassDiscountCents) / 100
        }
      }
    });

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BOOKING_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create booking'
        }
      },
      { status: 500 }
    );
  }
}

// GET /api/bookings/:id - Get booking details (for future implementation)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: { message: 'Not implemented yet' } },
    { status: 501 }
  );
}
