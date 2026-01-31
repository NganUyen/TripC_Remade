/**
 * Flight Data Transformers
 * Transform API responses to match component formats
 */

interface APIFlightOffer {
    offer_id: string;
    price: {
        total: number;
        base_fare: number;
        taxes_fees: number;
        currency: string;
    };
    seats_available: number;
    cabin_class: string;
    fare_family?: string;
    fare_basis_code?: string;
    booking_class?: string;
    flexibility: {
        refundable: boolean;
        changeable: boolean;
        change_fee?: number;
        cancellation_fee?: number;
    };
    baggage_included?: string;
    valid_until: string;
    flight: {
        id: string;
        airline: {
            code: string;
            name: string;
        };
        flight_number: string;
        route: {
            origin: {
                code: string;
                name: string;
            };
            destination: {
                code: string;
                name: string;
            };
        };
        schedule: {
            departure: string;
            arrival: string;
            duration_minutes: number;
        };
        aircraft?: string;
        status: string;
    };
}

interface ComponentFlight {
    id: string;
    airline: {
        code: string;
        name: string;
        logo?: string;
    };
    flightNumber: string;
    departure: {
        airport: string;
        city: string;
        time: string;
        terminal?: string;
    };
    arrival: {
        airport: string;
        city: string;
        time: string;
        terminal?: string;
    };
    duration: string; // e.g., "2h 15m"
    stops: number;
    price: number;
    currency: string;
    cabinClass: string;
    seatsAvailable: number;
    baggage?: string;
    refundable: boolean;
    aircraft?: string;
}

/**
 * Transform API flight offer to component format
 */
export function transformApiToFlight(apiOffer: APIFlightOffer): ComponentFlight {
    const { flight, price, seats_available, cabin_class, flexibility, baggage_included } = apiOffer;

    // Format duration from minutes to "Xh Ym"
    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return {
        id: apiOffer.offer_id,
        airline: {
            code: flight.airline.code,
            name: flight.airline.name,
            logo: `/airlines/${flight.airline.code.toLowerCase()}.png`, // Assuming logo path convention
        },
        flightNumber: flight.flight_number,
        departure: {
            airport: flight.route.origin.code,
            city: flight.route.origin.name,
            time: flight.schedule.departure,
        },
        arrival: {
            airport: flight.route.destination.code,
            city: flight.route.destination.name,
            time: flight.schedule.arrival,
        },
        duration: formatDuration(flight.schedule.duration_minutes),
        stops: 0, // Direct flight (API doesn't have stops info yet)
        price: price.total,
        currency: price.currency,
        cabinClass: cabin_class,
        seatsAvailable: seats_available,
        baggage: baggage_included,
        refundable: flexibility.refundable,
        aircraft: flight.aircraft,
    };
}

/**
 * Transform array of API offers to component flights
 */
export function transformApiToFlights(apiOffers: APIFlightOffer[]): ComponentFlight[] {
    return apiOffers.map(transformApiToFlight);
}

/**
 * Helper: Check if a date string is today
 */
export function isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();

    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

/**
 * Helper: Filter flights to only show future times for same-day searches
 */
export function filterFutureFlights(flights: ComponentFlight[], departDate: string): ComponentFlight[] {
    if (!isToday(departDate)) {
        return flights;
    }

    const now = new Date();
    return flights.filter(flight => {
        const departureTime = new Date(flight.departure.time);
        return departureTime > now;
    });
}
