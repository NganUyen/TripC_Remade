import { Plane, ArrowRight } from "lucide-react"
import { useBookingStore } from "@/store/useBookingStore"

export function FlightDetailsSummary() {
    const { selectedFlights, trip } = useBookingStore()

    if (!selectedFlights || selectedFlights.length === 0) return null

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
                <Plane className="w-5 h-5 text-slate-900 dark:text-white" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Flight Details</h3>
                <span className="px-3 py-1 rounded-full bg-[#FF5E1F] text-white text-[10px] font-bold uppercase tracking-wider">
                    {selectedFlights.length > 1 ? 'Round Trip' : 'One Way'}
                </span>
            </div>

            <div className="space-y-6">
                {selectedFlights.map((flight, index) => (
                    <div key={flight.id || index}>
                        {index > 0 && <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-6"></div>}
                        <div className="relative">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        {index === 0 ? 'Outbound Flight' : 'Return Flight'}
                                    </div>
                                    <div className="flex items-end gap-2 text-slate-900 dark:text-white">
                                        <span className="text-2xl font-black">{flight.departure?.time || '00:00'}</span>
                                        <span className="text-sm font-bold mb-1">{flight.departure?.airport}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {flight.departure?.date}
                                    </div>
                                </div>

                                <div className="flex-1 px-8 text-center mt-3">
                                    <div className="text-xs text-slate-400 mb-1">{flight.duration}</div>
                                    <div className="h-[2px] bg-slate-100 dark:bg-slate-800 relative w-full">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop`}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 opacity-0">Arrival</div>
                                    <div className="flex items-end gap-2 text-slate-900 dark:text-white justify-end">
                                        <span className="text-2xl font-black">{flight.arrival?.time || '00:00'}</span>
                                        {flight.arrival?.daysAdded > 0 && (
                                            <span className="text-[10px] font-bold text-[#FF5E1F] mb-3">+{flight.arrival.daysAdded}</span>
                                        )}
                                        <span className="text-sm font-bold mb-1">{flight.arrival?.airport}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {flight.arrival?.date}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className={`w-4 h-4 rounded-full ${flight.airlineColor || 'bg-slate-200'} flex items-center justify-center`}>
                                    <Plane className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{flight.airline}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{flight.flightNumber}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{trip.class}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
