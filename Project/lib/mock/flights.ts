
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
        const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0')
        const durationHours = 2 + Math.floor(Math.random() * 12)
        const durationMinutes = Math.floor(Math.random() * 60)

        // Simple arrival calc
        let arrHour = (hour + durationHours) % 24
        const arrMinute = (parseInt(minute) + durationMinutes) % 60

        const priceBase = 150 + Math.floor(Math.random() * 500)

        return {
            id: `${airline.code}-${from}-${to}-${1000 + i}`,
            airline: airline.name,
            airlineCode: airline.code,
            airlineColor: airline.color,
            flightNumber: `${airline.code} ${100 + i}`,
            departure: { time: `${hour.toString().padStart(2, '0')}:${minute}`, airport: from },
            arrival: { time: `${arrHour.toString().padStart(2, '0')}:${arrMinute.toString().padStart(2, '0')}`, airport: to },
            duration: `${durationHours}h ${durationMinutes}m`,
            stops: Math.random() > 0.7 ? 1 : 0,
            price: priceBase,
            isBestValue: i === 0 || i === 5
        }
    })
}
