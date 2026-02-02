/**
 * Ticket Issuance Service
 * POST /api/flight/ticket/issue
 *
 * Generates e-tickets after successful payment
 * Creates 13-digit ticket numbers and triggers email delivery
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/flight/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/flight/clerkAuth";

interface TicketIssuanceRequest {
  booking_id: string;
}

export async function POST(request: NextRequest) {
  try {
    // Allow both user auth and service role (for webhook triggers)
    const { userId } = await verifyClerkAuth();

    const body: TicketIssuanceRequest = await request.json();
    const { booking_id } = body;

    if (!booking_id) {
      return NextResponse.json(
        { error: "Missing required field: booking_id" },
        { status: 400 },
      );
    }

    const supabase = supabaseServerClient;

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("flight_bookings")
      .select(
        `
        *,
        offer:flight_offers(*),
        flight:flights(*)
      `,
      )
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify booking is paid
    if (booking.payment_status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Booking payment not completed" },
        { status: 400 },
      );
    }

    // Check if tickets already issued
    const { data: existingTickets } = await supabase
      .from("booking_tickets")
      .select("id")
      .eq("booking_id", booking_id)
      .limit(1);

    if (existingTickets && existingTickets.length > 0) {
      return NextResponse.json(
        { error: "Tickets already issued for this booking" },
        { status: 400 },
      );
    }

    // Generate tickets for each passenger
    const tickets = [];
    const passengers = booking.passengers as any[];

    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      const ticketNumber = generateTicketNumber();

      const { data: ticket, error: ticketError } = await supabase
        .from("booking_tickets")
        .insert({
          booking_id: booking.id,
          user_id: booking.user_id,
          ticket_number: ticketNumber,
          passenger_first_name: passenger.first_name,
          passenger_last_name: passenger.last_name,
          passenger_dob: passenger.dob,
          passenger_document_type: passenger.document_type,
          passenger_document_number: passenger.document_number,
          passenger_nationality: passenger.nationality,
          ticket_status: "ISSUED",
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (ticketError) {
        console.error("Ticket creation error:", ticketError);
        continue;
      }

      tickets.push(ticket);
    }

    // Update booking ticketing status
    await supabase
      .from("flight_bookings")
      .update({
        ticketing_status: "TICKETED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    // Generate PDF boarding passes (TODO: implement PDF generation)
    const boardingPassUrls = await generateBoardingPasses(booking, tickets);

    // Send ticket notification email
    await sendTicketEmail(booking, tickets, boardingPassUrls);

    // Create notification record
    await supabase.from("booking_notifications").insert({
      booking_id: booking.id,
      user_id: booking.user_id,
      notification_type: "TICKET_ISSUED",
      channel: "EMAIL",
      recipient: booking.lead_passenger_email,
      subject: `E-Tickets Issued - Booking ${booking.pnr}`,
      content: `Your e-tickets have been issued. Please find them attached.`,
      status: "SENT",
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        tickets: tickets.map((t) => ({
          id: t.id,
          ticket_number: t.ticket_number,
          passenger_name: `${t.passenger_first_name} ${t.passenger_last_name}`,
          status: t.ticket_status,
        })),
        message: "Tickets issued successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Ticket issuance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Generate 13-digit ticket number
 * Format: XXX-YYYYYYYYYY (airline code + 10 digits)
 */
function generateTicketNumber(): string {
  const airlineCode = "618"; // TripC airline code (customizable)
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `${airlineCode}-${randomDigits}`;
}

/**
 * Generate PDF boarding passes
 * TODO: Implement PDF generation using libraries like PDFKit or Puppeteer
 */
async function generateBoardingPasses(
  booking: any,
  tickets: any[],
): Promise<string[]> {
  // Placeholder implementation
  // In production, generate actual PDF files and upload to storage
  const urls = tickets.map((ticket) => {
    return `${process.env.NEXT_PUBLIC_APP_URL || ''}/boarding-pass/${ticket.id}.pdf`;
  });

  // TODO: Generate actual PDF files
  /*
  import PDFDocument from 'pdfkit';
  
  for (const ticket of tickets) {
    const doc = new PDFDocument();
    doc.fontSize(20).text(`Boarding Pass`, 100, 100);
    doc.fontSize(12).text(`Ticket: ${ticket.ticket_number}`, 100, 130);
    doc.fontSize(12).text(`Passenger: ${ticket.passenger_first_name} ${ticket.passenger_last_name}`, 100, 150);
    doc.fontSize(12).text(`Flight: ${booking.flight.flight_number}`, 100, 170);
    doc.fontSize(12).text(`PNR: ${booking.pnr}`, 100, 190);
    
    // Upload to storage and get URL
    const url = await uploadPDF(doc, ticket.id);
    urls.push(url);
  }
  */

  return urls;
}

/**
 * Send ticket email with boarding pass attachments
 * TODO: Implement email service (SendGrid, Resend, etc.)
 */
async function sendTicketEmail(
  booking: any,
  tickets: any[],
  boardingPassUrls: string[],
) {
  // Placeholder implementation
  console.log("Sending ticket email to:", booking.lead_passenger_email);
  console.log(
    "Tickets:",
    tickets.map((t) => t.ticket_number),
  );
  console.log("Boarding passes:", boardingPassUrls);

  // TODO: Implement actual email sending
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'bookings@tripc.com',
    to: booking.lead_passenger_email,
    subject: `E-Tickets Issued - Booking ${booking.pnr}`,
    html: `
      <h1>Your E-Tickets are Ready!</h1>
      <p>Dear ${booking.passengers[0].first_name},</p>
      <p>Your flight tickets have been issued successfully.</p>
      <p><strong>Booking Reference:</strong> ${booking.pnr}</p>
      <p><strong>Flight:</strong> ${booking.flight.flight_number}</p>
      <p>Please find your boarding passes attached.</p>
    `,
    attachments: boardingPassUrls.map(url => ({
      filename: 'boarding-pass.pdf',
      path: url
    }))
  });
  */
}
