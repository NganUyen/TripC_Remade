export function PopularRoutes() {
    return (
        <section className="relative z-10 bg-background-light dark:bg-background-dark py-20 lg:py-28 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Popular Routes</h3>
                        <p className="text-slate-500 dark:text-white/60 text-base max-w-xl">Fly to the most sought-after destinations with our exclusive partner airlines.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <a href="#" className="text-primary hover:text-orange-600 dark:hover:text-white font-bold text-sm uppercase tracking-wider flex items-center gap-1 transition-colors group">
                            View all routes
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                </div>

                <div className="grid grid-flow-col auto-cols-[85%] md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible no-scrollbar pb-6 md:pb-0 snap-x snap-mandatory">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-[#2c241b] rounded-3xl p-6 hover:shadow-xl dark:hover:bg-[#362d23] transition-all duration-300 border border-slate-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-white/10 shadow-lg snap-center group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-white/5 rounded-full">
                            <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-white/40">flight_takeoff</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="size-14 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAxlrhQ8fENML3lJzUB1GD1r_2ETaLxNFS3EZljm7PPQBP1QxcbBEt9mvVGtBX7EO6tEUinm4S5r3_LxPNrnUELHGB__C4osoKNKSWP2ZrKNA57VfpBrHRrdTrIHdZ8AErFXu51FF9KXJeiw-y6H82GLjoVqGUikhPVQO1q3tURWFn7roulmLKO-BB8Tbhf1xoBzoitOXFC75BtocqriLINa7N5NlHGBCXQM_3INRraVMuteum-QQDoBkZumQlCgM7CSCiXcXTZC0" alt="Delta" className="w-8 h-8 object-contain opacity-90" />
                            </div>
                            <div>
                                <h4 className="text-slate-900 dark:text-white font-bold text-lg">Delta Airlines</h4>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-white/50">
                                    <span className="material-symbols-outlined text-[14px] text-yellow-500 fill-current">star</span>
                                    4.8 Rating
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="text-left">
                                <div className="text-3xl font-black text-slate-900 dark:text-white">LHR</div>
                                <div className="text-sm text-slate-500 dark:text-white/50 font-medium">London</div>
                            </div>
                            <div className="flex flex-col items-center justify-center w-full px-4">
                                <span className="text-xs text-slate-400 dark:text-white/40 mb-1">9h 20m</span>
                                <div className="w-full h-[2px] bg-slate-200 dark:bg-white/10 relative">
                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30"></div>
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30"></div>
                                    {/* <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-white dark:bg-[#2c241b] px-1 rotate-90 text-lg">flight</span> */}
                                </div>
                                <span className="text-xs text-green-600 dark:text-green-500 font-bold mt-1">Direct</span>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-slate-900 dark:text-white">JFK</div>
                                <div className="text-sm text-slate-500 dark:text-white/50 font-medium">New York</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
                            <div className="flex -space-x-2">
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-[#2c241b] overflow-hidden"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjUO-wu9wxIoUMUPkdmaVsktMTuQ2Qz7sskU13mOnW3vCvO2x2C91FCiynUZG_P7-RcJdu3w6ZrdRc1HiBXfcBR3Wc1pQcaxcb9HyJvuUovTRBoJYxT6-nXfmviATk-rt7zBqFpxFYAiVOayXW6pUupGOmdo1YaqrRQz2iGW6E_KqpuG6ZdPXn5O9ft9YTThn6esDI4ht_iPHjgy03rWg18JDlr8ABR3GdaR825rH9nV3bceyAaLIgUzBOeKbfZzfmnohsaRpj0Kw" className="w-full h-full object-cover" /></div>
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-[#2c241b] overflow-hidden"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY8WM00notZAk4e5XI_MxX0odx3PzsStSTKA-Oio3Lvsoc7QvNcRAOnEANwMVQDCugopAt-5JjijKaT7fZw7MsfgAQkvWeXdXYDO4ZPAmflLpnYAvbXAdxH4GDztPD_wU3r6Lksz1nnKD_llCz6tycysMnqa7GwegD4iB5maprLNQuWkP7-94tGeUAf5xC1bvXd9Vt8AXUxoX784V3qa6fCv2IkaI1N-FCdoITn3ml4QzYcPszKgX9VE4cVki_3Qc3eKY1pGqPwrI" className="w-full h-full object-cover" /></div>
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-gray-700 border-2 border-white dark:border-[#2c241b] flex items-center justify-center text-[10px] text-slate-600 dark:text-white font-bold">+24</div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Starting from</p>
                                <div className="flex items-baseline gap-1 price-animate">
                                    <span className="text-primary text-2xl font-black">$450</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white dark:bg-[#2c241b] rounded-3xl p-6 hover:shadow-xl dark:hover:bg-[#362d23] transition-all duration-300 border border-slate-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-white/10 shadow-lg snap-center group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-white/5 rounded-full">
                            <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-white/40">public</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="size-14 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjZoxrNRBITce6UJ0JKslHRynifS4xXLHFaX0BWu6uhLXQ4TFhoIEY4mS0ssA0i3DHAyHQrpJxIWi3uNoGvwpnodo6u0ymYsLFhOEDeOyWztlFYBcSQrQa1vlt-sRpFG1eFP_zFQrkg3EmuhDLNSCqyD30mrYiFIO2c7WLj6ivRPpd8mWZCyleVx3ZZy3ALf0SsfkDMUcVVYCnGqwypMk0xACF8hEdAeVfPxEOzSyWsuCE5-fz_9GFSDmQ8-z_OsjT5ck-AOxVipQ" alt="ANA" className="w-8 h-8 object-contain opacity-90" />
                            </div>
                            <div>
                                <h4 className="text-slate-900 dark:text-white font-bold text-lg">ANA</h4>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-white/50">
                                    <span className="material-symbols-outlined text-[14px] text-yellow-500 fill-current">star</span>
                                    4.9 Rating
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="text-left">
                                <div className="text-3xl font-black text-slate-900 dark:text-white">SFO</div>
                                <div className="text-sm text-slate-500 dark:text-white/50 font-medium">San Fran</div>
                            </div>
                            <div className="flex flex-col items-center justify-center w-full px-4">
                                <span className="text-xs text-slate-400 dark:text-white/40 mb-1">11h 45m</span>
                                <div className="w-full h-[2px] bg-slate-200 dark:bg-white/10 relative">
                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30"></div>
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30"></div>


                                    {/* <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-white dark:bg-[#2c241b] px-1 rotate-90 text-lg">flight</span> */}
                                </div>
                                <span className="text-xs text-green-600 dark:text-green-500 font-bold mt-1">Direct</span>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-slate-900 dark:text-white">NRT</div>
                                <div className="text-sm text-slate-500 dark:text-white/50 font-medium">Tokyo</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
                            <div className="flex -space-x-2">
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-[#2c241b] overflow-hidden"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS5Td5igZJUjPrBKZ6nBsXEfsIZrs7pMnFwXGPhpkt4Epazf3GLYzj5d3EAzcgwmRnkx4GSjUmHN8A_oW4RJRyG6GPdkRTRZ5L85LA_sJ7a6uhoIC3KqVpELctRop2eW5BT6TXHuksyykGVdQ1HsSzKaA5hR_tu0BlVi6z0HTwfSkHCr67-w-64gYl3JK0_4OfdyOvUAwPwtPXBuJDPEHDjsACL4ewoCBykQZuin5GBndJXlF_KImlejv_sMh0fOmclMHRTdMDeUo" className="w-full h-full object-cover" /></div>
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-[#2c241b] overflow-hidden"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQkNu_XKKcdREycMwytZnq3yNA8hFkpvFjYWQj-Htq77VYldismulgV_riXkxWEUc2S-2etq-MiXhRWYc7V8yPW0gjSnh3SCNU5ehpIvd050hYJzISOAlqPAyDh7Yh6qv4phfkLjirWiqJ7FZYhcFvKRK1fi6wa17zOyHRgdBAw2O8FtQNs9lg7TVnu49ar1bNbQzR4InkTclRpRIPS2Dr4tqqePfnt9MW1EM6_6bzi-437odeyPSf75NXQuC-1KdDKvfs0j2lu6w" className="w-full h-full object-cover" /></div>
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-gray-700 border-2 border-white dark:border-[#2c241b] flex items-center justify-center text-[10px] text-slate-600 dark:text-white font-bold">+86</div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Starting from</p>
                                <div className="flex items-baseline gap-1 price-animate" style={{ animationDelay: '100ms' }}>
                                    <span className="text-primary text-2xl font-black">$820</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white dark:bg-[#2c241b] rounded-3xl p-6 hover:shadow-xl dark:hover:bg-[#362d23] transition-all duration-300 border border-slate-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-white/10 shadow-lg snap-center group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-white/5 rounded-full">
                            <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-white/40">connecting_airports</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="size-14 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPienoE87dyVCXRIIafjfEWgXEjE0B6yPesL_1YgydZ3XhJLZw8E9BQ7Qi2vJCgT7gY3ou6HFWdDmI-ObtI2XgeBnkD7OYN_FPtDP7n-zFLxNzCWPC-eZQxIofVAf3If_n79-PsRF8nvDRYE4bLJIpB3kWiP1s2uNAKvuTEnx3AjJ7ofNW7i2ZfUdkAolQKBHuJJwicUK7TVcKavRnw0qOpNuTSFWFwN2ACV8vL4hinRgSRCEJUhh5XWs-OyXkkoQcNKJIBzr_68M" alt="Emirates" className="w-8 h-8 object-contain opacity-90" />
                            </div>
                            <div>
                                <h4 className="text-slate-900 dark:text-white font-bold text-lg">Emirates</h4>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-white/50">
                                    <span className="material-symbols-outlined text-[14px] text-yellow-500 fill-current">star</span>
                                    4.9 Rating
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="text-left">
                                <div className="text-3xl font-black text-slate-900 dark:text-white">DXB</div>
                                <div className="text-sm text-slate-500 dark:text-white/50 font-medium">Dubai</div>
                            </div>
                            <div className="flex flex-col items-center justify-center w-full px-4">
                                <span className="text-xs text-slate-400 dark:text-white/40 mb-1">7h 15m</span>
                                <div className="w-full h-[2px] bg-slate-200 dark:bg-white/10 relative">
                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30"></div>
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30"></div>
                                    {/* <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-white dark:bg-[#2c241b] px-1 rotate-90 text-lg">flight</span> */}
                                </div>
                                <span className="text-xs text-green-600 dark:text-green-500 font-bold mt-1">Direct</span>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-slate-900 dark:text-white">CDG</div>
                                <div className="text-sm text-slate-500 dark:text-white/50 font-medium">Paris</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
                            <div className="flex -space-x-2">
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-[#2c241b] overflow-hidden"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzsuZ0qo3MA7BQwFEhViEKyiWRm3LubHEIopllsQStFS8QsAe6xYg_3Wj1_r1jhtaUuDbtwCxxMkUdW3khuEjYd2FwNXOqTqkA1zAwFTAdCt8purA70XwYsBG_CCbvV06WAu722NGgZwHBeEFg2h5FRMu6faLsQODrJtYKVIN0MrfsMqec56cbCqhIeKqICvP8ejl0S5i4c8z2e8ef_V5RYqs4Dd42NMo2bSdPKUtQ-ofD6_J51Gkog0zlomK_RUKbmuIZ8KNYnAs" className="w-full h-full object-cover" /></div>
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-[#2c241b] overflow-hidden"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmDUfN4SDitw8Ikb6LE1elpWet3BIczKEctoYHNUjGmVQDvoqOxWCs4Ypp7CH23JyXmEplrvC-msEyAHXUYBHrZSP1o19hgwv1aFzddK8P9OBAAhupIdcxwo_on_R0feYhfjRGY8QcahoNCw63Ii-bGO_2AwCnTu4Bwbmh_kdcak9KQipiBS2qfDUCbtD9pte68-bxR9CtRhqq7f_BTVVewcMFjrxtPLFDlvuy-898-p-w3y6p3LUcbiVWgYa1EUsZsj5yqyK5NnE" className="w-full h-full object-cover" /></div>
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-gray-700 border-2 border-white dark:border-[#2c241b] flex items-center justify-center text-[10px] text-slate-600 dark:text-white font-bold">+52</div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Starting from</p>
                                <div className="flex items-baseline gap-1 price-animate" style={{ animationDelay: '200ms' }}>
                                    <span className="text-primary text-2xl font-black">$560</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
