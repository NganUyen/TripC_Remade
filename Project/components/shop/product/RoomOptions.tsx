"use client"

import { Check } from 'lucide-react'

interface Room {
    id: string
    name: string
    size: string
    price: number
    image: string
}

interface RoomOptionsProps {
    rooms: Room[]
}

export function RoomOptions({ rooms }: RoomOptionsProps) {
    return (
        <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Choose your room</h3>
            <div className="space-y-4">
                {rooms.map((room) => (
                    <div key={room.id} className="group p-2 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 hover:border-[#FF5E1F] dark:hover:border-[#FF5E1F] transition-all flex flex-col md:flex-row gap-4 cursor-pointer">
                        <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 py-2 pr-4 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors">{room.name}</h4>
                                <span className="text-slate-500 dark:text-slate-400 text-sm">{room.size}</span>
                            </div>
                            <div className="flex items-center justify-between mt-4 md:mt-0">
                                <ul className="flex gap-4">
                                    <li className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                        <Check className="w-3 h-3 text-emerald-500" /> Free cancellation
                                    </li>
                                    <li className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                        <Check className="w-3 h-3 text-emerald-500" /> Breakfast included
                                    </li>
                                </ul>
                                <span className="font-bold text-slate-900 dark:text-white">+ ${room.price}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
