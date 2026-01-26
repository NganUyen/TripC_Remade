export type TransportType = 'bus' | 'train' | 'airplane' | 'limousine' | 'private_car';

export type VehicleType =
    | '4 seats'
    | '7 seats'
    | '16 seats'
    | '29 seats'
    | '45 seats'
    | 'limousine 9 seats';

export interface TransportProvider {
    id: string;
    name: string;
    logo_url: string | null;
    rating: number;
}

export interface TransportRoute {
    id: string;
    provider_id: string;
    type: TransportType;
    vehicle_type: VehicleType;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    currency: string;
    seats_available: number;
    vehicle_details: {
        wifi?: boolean;
        ac?: boolean;
        usb?: boolean;
        massage_chairs?: boolean;
        [key: string]: any;
    };
    images: string[];
    transport_providers?: Pick<TransportProvider, 'name' | 'logo_url' | 'rating'>;
}

export interface TransportBookingMetadata {
    route_id: string;
    vehicle_type: VehicleType;
    origin: string;
    destination: string;
    departure_time: string;
    [key: string]: any;
}

export interface PassengerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
}
