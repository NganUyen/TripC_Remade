
export const AIRLINES = [
    { name: "Delta Air Lines", code: "DL", color: "bg-red-600" },
    { name: "American Airlines", code: "AA", color: "bg-blue-600" },
    { name: "United Airlines", code: "UA", color: "bg-sky-600" },
    { name: "JetBlue", code: "B6", color: "bg-blue-500" },
    { name: "Alaska Airlines", code: "AS", color: "bg-emerald-600" },
    { name: "Vietnam Airlines", code: "VN", color: "bg-[#004280]" },
    { name: "VietJet Air", code: "VJ", color: "bg-red-500" },
    { name: "Bamboo Airways", code: "QH", color: "bg-emerald-500" },
]

export const generateFlights = (from: string, to: string, date: string, count = 25) => {
    return Array.from({ length: count }).map((_, i) => {
        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)]
        const hour = Math.floor(Math.random() * 24)
        const minute = Math.floor(Math.random() * 60)

        // Major Vietnam airports
        const vnAirports = ['HAN', 'SGN', 'DAD', 'PQC', 'CXR', 'HPH', 'VII', 'VCL']
        const isVN = vnAirports.includes(from) && vnAirports.includes(to)

        // Refined duration logic
        let durationHours = 1
        let durationMinutes = Math.floor(Math.random() * 60)

        if (isVN) {
            // Domestic VN: 1-2 hours
            const longHaulVN = (from === 'HAN' && (to === 'SGN' || to === 'PQC' || to === 'VCL')) ||
                (to === 'HAN' && (from === 'SGN' || from === 'PQC' || from === 'VCL'))
            durationHours = longHaulVN ? 2 : 1
            if (!longHaulVN) durationMinutes = 5 + Math.floor(Math.random() * 25) // 1h 05m to 1h 30m
            else durationMinutes = Math.floor(Math.random() * 20) // 2h 00m to 2h 20m
        } else {
            // International or fallback
            durationHours = 2 + Math.floor(Math.random() * 10)
            durationMinutes = Math.floor(Math.random() * 60)
        }

        // Correct arrival calc handling minute overflow
        const totalMinutes = minute + durationMinutes
        const extraHours = Math.floor(totalMinutes / 60)
        const arrMinute = totalMinutes % 60
        const totalHours = hour + durationHours + extraHours
        const arrHour = totalHours % 24
        const daysAdded = Math.floor(totalHours / 24)

        const priceBase = 150 + Math.floor(Math.random() * 500)

        const depDateObj = new Date(date)
        const arrDateObj = new Date(date)
        if (daysAdded > 0) arrDateObj.setDate(arrDateObj.getDate() + daysAdded)

        return {
            id: `${airline.code}-${from}-${to}-${1000 + i}`,
            airline: airline.name,
            airlineCode: airline.code,
            airlineColor: airline.color,
            flightNumber: `${airline.code} ${100 + i}`,
            departure: {
                time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                airport: from,
                date: depDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            },
            arrival: {
                time: `${arrHour.toString().padStart(2, '0')}:${arrMinute.toString().padStart(2, '0')}`,
                airport: to,
                date: arrDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                daysAdded
            },
            rawDepartureAt: new Date(depDateObj.setHours(hour, minute, 0, 0)).toISOString(),
            rawArrivalAt: new Date(arrDateObj.setHours(arrHour, arrMinute, 0, 0)).toISOString(),
            duration: `${durationHours}h ${durationMinutes}m`,
            stops: Math.random() > 0.7 ? 1 : 0,
            price: priceBase,
            isBestValue: i === 0 || i === 5
        }
    })
}
