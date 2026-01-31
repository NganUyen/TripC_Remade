import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getFlightById(id: string) {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) {
        console.warn('Flight not found in DB, checking if it is a mock ID:', id)

        // Mock ID format: {AIRLINE_CODE}-{FROM}-{TO}-{INDEX}-{PRICE}
        const parts = id.split('-')
        if (parts.length >= 4) {
            const [airlineCode, from, to, , priceStr] = parts
            const price = priceStr ? parseInt(priceStr) : 450
            const depDate = new Date()
            const arrDate = new Date()
            arrDate.setHours(arrDate.getHours() + 2)

            return {
                id: id,
                airline: airlineCode === 'VN' ? 'Vietnam Airlines' :
                    (airlineCode === 'VJ' ? 'VietJet Air' :
                        (airlineCode === 'QH' ? 'Bamboo Airways' : 'Mock Airline')),
                airlineCode: airlineCode,
                airlineColor: airlineCode === 'VN' ? 'bg-[#004280]' :
                    (airlineCode === 'VJ' ? 'bg-red-500' :
                        (airlineCode === 'QH' ? 'bg-emerald-500' : 'bg-emerald-500')),
                flightNumber: `${airlineCode} 123`,
                rawDepartureAt: depDate.toISOString(),
                rawArrivalAt: arrDate.toISOString(),
                departure: {
                    time: "10:00",
                    airport: from,
                    date: depDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                },
                arrival: {
                    time: "12:00",
                    airport: to,
                    date: arrDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    daysAdded: 0
                },
                duration: "2h 00m",
                stops: 0,
                price: price,
                isBestValue: false
            }
        }
        return null
    }

    const depAt = new Date(data.departure_at)
    const arrAt = new Date(data.arrival_at)

    // Calculate duration in hours and minutes
    const diffMs = arrAt.getTime() - depAt.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const durationHours = Math.floor(diffMins / 60)
    const durationMinutes = diffMins % 60

    // Calculate daysAdded
    const depDate = new Date(depAt.getFullYear(), depAt.getMonth(), depAt.getDate())
    const arrDate = new Date(arrAt.getFullYear(), arrAt.getMonth(), arrAt.getDate())
    const daysAdded = Math.floor((arrDate.getTime() - depDate.getTime()) / (1000 * 60 * 60 * 24))

    return {
        id: data.id,
        airline: data.airline_name,
        airlineCode: data.airline_code,
        airlineColor: data.airline_code === 'VN' ? 'bg-[#004280]' : (data.airline_code === 'VJ' ? 'bg-red-500' : 'bg-emerald-500'),
        flightNumber: data.flight_number,
        rawDepartureAt: data.departure_at,
        rawArrivalAt: data.arrival_at,
        departure: {
            time: depAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            airport: data.origin,
            date: depAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        },
        arrival: {
            time: arrAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            airport: data.destination,
            date: arrAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            daysAdded: daysAdded > 0 ? daysAdded : 0
        },
        duration: `${durationHours}h ${durationMinutes}m`,
        stops: 0,
        price: Number(data.base_price),
        isBestValue: false
    }
}

export async function getFlights(from: string, to: string, date: string) {
    const supabase = createServerSupabaseClient()

    // Convert date to range
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('origin', from)
        .eq('destination', to)
        .gte('departure_at', startOfDay.toISOString())
        .lte('departure_at', endOfDay.toISOString())
        .eq('status', 'active')

    if (error) {
        console.error('Error fetching flights:', error)
        return []
    }

    return data.map(f => {
        const depAt = new Date(f.departure_at)
        const arrAt = new Date(f.arrival_at)

        const diffMs = arrAt.getTime() - depAt.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const durationHours = Math.floor(diffMins / 60)
        const durationMinutes = diffMins % 60

        const depDate = new Date(depAt.getFullYear(), depAt.getMonth(), depAt.getDate())
        const arrDate = new Date(arrAt.getFullYear(), arrAt.getMonth(), arrAt.getDate())
        const daysAdded = Math.floor((arrDate.getTime() - depDate.getTime()) / (1000 * 60 * 60 * 24))

        return {
            id: f.id,
            airline: f.airline_name,
            airlineCode: f.airline_code,
            airlineColor: f.airline_code === 'VN' ? 'bg-[#004280]' : (f.airline_code === 'VJ' ? 'bg-red-500' : 'bg-emerald-500'),
            flightNumber: f.flight_number,
            rawDepartureAt: f.departure_at,
            rawArrivalAt: f.arrival_at,
            departure: {
                time: depAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                airport: f.origin,
                date: depAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            },
            arrival: {
                time: arrAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                airport: f.destination,
                date: arrAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                daysAdded: daysAdded > 0 ? daysAdded : 0
            },
            duration: `${durationHours}h ${durationMinutes}m`,
            stops: 0,
            price: Number(f.base_price),
            isBestValue: false
        }
    })
}
