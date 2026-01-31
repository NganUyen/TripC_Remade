/**
 * Centralized Airport Data
 * Comprehensive list of airports for fuzzy search
 */

export interface Airport {
    code: string;        // IATA code (3 letters)
    name: string;        // Full airport name
    city: string;        // City name
    country: string;     // Country name
    timezone?: string;   // Optional timezone
}

export const AIRPORTS: Airport[] = [
    // Vietnam
    { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'CXR', name: 'Cam Ranh International Airport', city: 'Nha Trang', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'HPH', name: 'Cat Bi International Airport', city: 'Hai Phong', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'VII', name: 'Vinh International Airport', city: 'Vinh', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'HUI', name: 'Phu Bai International Airport', city: 'Hue', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'VCA', name: 'Can Tho International Airport', city: 'Can Tho', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'PQC', name: 'Phu Quoc International Airport', city: 'Phu Quoc', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'DLI', name: 'Lien Khuong Airport', city: 'Da Lat', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'UIH', name: 'Phu Cat Airport', city: 'Quy Nhon', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    { code: 'VDO', name: 'Van Don International Airport', city: 'Quang Ninh', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },

    // Asia - Major Hubs
    { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok' },
    { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
    { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
    { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul' },
    { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
    { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai' },
    { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai' },
    { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei' },
    { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', timezone: 'Asia/Manila' },
    { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
    { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta' },
    { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia', timezone: 'Asia/Makassar' },

    // Middle East
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
    { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar' },
    { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'UAE', timezone: 'Asia/Dubai' },

    // Europe
    { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', timezone: 'Europe/Berlin' },
    { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul' },
    { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', timezone: 'Europe/Berlin' },
    { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome', country: 'Italy', timezone: 'Europe/Rome' },
    { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid' },
    { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', timezone: 'Europe/Madrid' },

    // North America
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', timezone: 'America/New_York' },
    { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles' },
    { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles' },
    { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', timezone: 'America/Chicago' },
    { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', timezone: 'America/New_York' },
    { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto' },
    { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver' },

    // Oceania
    { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
    { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne' },
    { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland' },
];

// Helper functions
export const findAirportByCode = (code: string): Airport | undefined => {
    return AIRPORTS.find(airport => airport.code.toUpperCase() === code.toUpperCase());
};

export const getPopularAirports = (limit: number = 10): Airport[] => {
    // Return most popular airports (Vietnam + major hubs)
    return AIRPORTS.slice(0, limit);
};

export const getVietnamAirports = (): Airport[] => {
    return AIRPORTS.filter(airport => airport.country === 'Vietnam');
};
