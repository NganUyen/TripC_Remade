export function ExploreGrid() {
    return (
        <section className="bg-background-light dark:bg-background-dark py-12 lg:py-20 relative">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-b from-primary/5 to-transparent blur-[120px] pointer-events-none"></div>
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
                <h3 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-extrabold mb-12 tracking-tight">Explore the World</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-[300px_300px_300px] md:grid-rows-[280px_280px] gap-6">

                    {/* Kyoto */}
                    <div className="relative group md:col-span-2 md:row-span-2 rounded-[2rem] overflow-hidden cursor-pointer shadow-depth">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 will-change-transform" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBc1hpLGQ6g31AHREPHPBh7zjMp7V-QbopnZbnlOOYk1_K3d8VuCHyg_qM3yYbZRhZsNeT_w_ppWMywG0KVWHpytfp9CRn8PqZWnlurJC-LJExm5IKFLxhBVGJnPEp8Xk75zdv1b5H01kwmGJZSXyOz9VFqe76sXYWSxoRnb6fpQOqGWqZJ9CXbNQevQyzbZc3Qux8QaypFawOftsDVxVx7e7ZH0Kj2m19LEfrfSzyfQs3NIOcKy62mGD3cKvyPni_o5A0MZn6WpwA')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-6 left-6 z-20">
                            <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Trending Now</span>
                        </div>
                        <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full z-20">
                            <h4 className="text-white text-3xl md:text-5xl font-black mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">Kyoto, Japan</h4>
                            <p className="text-white/80 text-base md:text-lg max-w-md line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                Discover ancient temples and sublime gardens in the cultural capital.
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 bg-primary hover:bg-white text-white hover:text-primary px-6 py-3 rounded-full font-bold transition-colors duration-300 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-150">
                                <span>Find Flights</span>
                                <span className="material-symbols-outlined text-lg animate-bounce-x">arrow_forward</span>
                            </div>
                        </div>
                    </div>

                    {/* Paris */}
                    <div className="relative group md:col-span-1 md:row-span-2 rounded-[2rem] overflow-hidden cursor-pointer shadow-depth">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsxfa34OYRVaDWDqxI2lTm935znU_SegYwCyOjd5pUR6I0aHdMOfRMEwkC29mnvh3k4OZiRm94LgjE7HhNW0daE4Q_FlMmmKf4kVp8eeEN04hROE8wsHxJhHAFW9pxi_EvQ3EtXkRS9YcB77khFL6txGvZcESZuA39nxqC87WiLZ8cp8TRqLSWqT7234IFW8yJCz_aCpSvfToWyLvvcg4-k2qbSHVZbb_mcWHe85rM9ibkDhWBPAKE2MwsHmGNIyjuAAN0rRdriSc')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full z-20 transform group-hover:-translate-y-2 transition-transform duration-500">
                            <div className="flex justify-between items-end mb-2">
                                <h4 className="text-white text-2xl md:text-3xl font-black">Paris</h4>
                                <span className="text-primary font-bold text-lg bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">$420+</span>
                            </div>
                            <p className="text-white/60 text-sm font-medium">France</p>
                        </div>
                    </div>

                    {/* Bali */}
                    <div className="relative group md:col-span-1 md:row-span-1 rounded-[2rem] overflow-hidden cursor-pointer shadow-depth">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-sm9mYP_ciC7CaMjwS5Ppb68G3KQbMPAwtXqR9FDHYqO_Blt7QIY8-aAxNeUHXrsPSS43eGKi99U9kgZUDhsesDNEIgkG_sF93i_N05iyERvbjjH3Z52KhFWc65T53D6pUWudsCHbYioDvk7H6ew_lMXphu1Md1saWCpjDmjDjt4O-8R2zKs4lZe6Sc-gPUrSbBuAy8QfU63fqq2WHzL8-z5DAq_rK-Wl6cIS78SgR73CVNQ2m3Z40P0FcsuQVhKhx8Do9P-aQ9k')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full z-20">
                            <h4 className="text-white text-xl font-bold mb-1">Bali</h4>
                            <p className="text-white/60 text-xs uppercase tracking-wider font-bold">Indonesia</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="material-symbols-outlined text-white text-sm -rotate-45">arrow_forward</span>
                        </div>
                    </div>

                    {/* Dubai */}
                    <div className="relative group md:col-span-1 md:row-span-1 rounded-[2rem] overflow-hidden cursor-pointer shadow-depth">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrKCy0HmsZH8DKtanMNyHMirqDLJeDSGpn2ucxOL1vAHOEDoNE7cn_C7XJ-xwAQXdwjpBMKHqxFu4klcTvPjp8YSwGyIEm5d4fY_OS5cgd_iHtar15lyxYuP_pXMxmMJ04ZMapzZK23QvChuIYjHBO5vo7TUfHXJvH9PbwjU7OYvBs6gqSApfOf7IYs7pnDvDsHRbwK3UBSpGbMVh8eXMMAD-CWDMI_38vTFK_8VlnXfGI3Bix9pLE4S2-_6Yxq2bDZp1STaKME08')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full z-20">
                            <h4 className="text-white text-xl font-bold mb-1">Dubai</h4>
                            <p className="text-white/60 text-xs uppercase tracking-wider font-bold">UAE</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="material-symbols-outlined text-white text-sm -rotate-45">arrow_forward</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
