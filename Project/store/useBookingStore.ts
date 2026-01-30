import { create } from 'zustand'

export interface Passenger {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    passportNumber: string
    gender: 'male' | 'female' | 'other'
}

export interface BookingState {
    // Trip Info
    step: number // 1..6
    trip: {
        from: string
        to: string
        date: string
        returnDate?: string
        passengersCount: number
        class: string
    }

    // User Input
    passengers: Passenger[]
    contact: {
        email: string
        phone: string
    }

    // Selections
    seats: Record<string, string> // flightId_passengerId -> seatCode
    extras: {
        baggage: Record<string, string> // flightId_passengerId -> baggageId
        meals: Record<string, string> // flightId_passengerId -> mealId
    }
    insurance: 'no' | 'basic' | 'standard' | 'premium'

    // Payment
    promoCode: string
    useTcent: boolean
    paymentMethod: string

    // Selected Flight Details
    selectedFlights: any[]

    // Actions
    setStep: (step: number) => void
    setTrip: (trip: BookingState['trip']) => void
    updatePassenger: (index: number, data: Partial<Passenger>) => void
    setContact: (contact: Partial<BookingState['contact']>) => void
    selectSeat: (key: string, seat: string) => void
    selectBaggage: (key: string, option: string) => void
    selectMeal: (key: string, option: string) => void
    setInsurance: (plan: BookingState['insurance']) => void
    setPromoCode: (code: string) => void
    toggleTcent: () => void
    setPaymentMethod: (method: string) => void
    setSelectedFlights: (flights: any[]) => void
}

export const useBookingStore = create<BookingState>((set) => ({
    step: 1,
    trip: { from: '', to: '', date: '', passengersCount: 1, class: 'Economy' },

    passengers: [{ id: '1', firstName: '', lastName: '', dateOfBirth: '', nationality: '', passportNumber: '', gender: 'male' }], // Init with 1 empty
    contact: { email: '', phone: '' },

    seats: {},
    extras: { baggage: {}, meals: {} },
    insurance: 'no',

    promoCode: '',
    useTcent: false,
    paymentMethod: 'payos',
    selectedFlights: [],

    setStep: (step) => set({ step }),
    setTrip: (trip) => set((state) => ({
        trip,
        // Reset passengers array if count changes (simplified logic)
        passengers: Array(trip.passengersCount).fill(null).map((_, i) => state.passengers[i] || { id: String(i + 1), firstName: '', lastName: '', dateOfBirth: '', nationality: '', passportNumber: '', gender: 'male' })
    })),
    updatePassenger: (index, data) => set((state) => {
        const newPassengers = [...state.passengers]
        newPassengers[index] = { ...newPassengers[index], ...data }
        return { passengers: newPassengers }
    }),
    setContact: (data) => set((state) => ({ contact: { ...state.contact, ...data } })),
    selectSeat: (key, seat) => set((state) => ({ seats: { ...state.seats, [key]: seat } })),
    selectBaggage: (key, option) => set((state) => ({ extras: { ...state.extras, baggage: { ...state.extras.baggage, [key]: option } } })),
    selectMeal: (key, option) => set((state) => ({ extras: { ...state.extras, meals: { ...state.extras.meals, [key]: option } } })),
    setInsurance: (plan) => set({ insurance: plan }),
    setPromoCode: (code) => set({ promoCode: code }),
    toggleTcent: () => set((state) => ({ useTcent: !state.useTcent })),
    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setSelectedFlights: (flights) => set({ selectedFlights: flights }),
}))
