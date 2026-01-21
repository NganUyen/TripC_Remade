export function ExploreGrid() {
    return (
        <section className="bg-background-light dark:bg-background-dark py-12 lg:py-20 relative">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-b from-primary/5 to-transparent blur-[120px] pointer-events-none"></div>
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
                <h3 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-extrabold mb-12 tracking-tight">Explore the World</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-[300px_300px_300px] md:grid-rows-[280px_280px] gap-6">

                    {/* Hoi An - Main Feature */}
                    <div className="relative group md:col-span-2 md:row-span-2 rounded-[2rem] overflow-hidden cursor-pointer shadow-depth">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 will-change-transform" style={{ backgroundImage: "url('https://res.cloudinary.com/difdkbohi/image/upload/v1759226374/a8a622ae-ffc9-40d2-b2e7-a8a1470b84bc.png')" }}></div>
                        {/* Lighter Gradient for 'Clean' look */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>

                        <div className="absolute top-6 left-6 z-20">
                            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                                Ancient Town
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full z-20">
                            <h4 className="text-white text-3xl md:text-5xl font-black mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 drop-shadow-md">
                                Hoi An, Vietnam
                            </h4>
                            <div className="flex items-center gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                <p className="text-white/95 text-base md:text-lg max-w-md line-clamp-2 font-medium drop-shadow-sm">
                                    Lantern-lit streets and yellow heritage houses.
                                </p>
                            </div>

                            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 hover:bg-white backdrop-blur-md border border-white/30 text-white hover:text-[#1c140d] px-6 py-3 rounded-full font-bold transition-all duration-300 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-150 shadow-lg">
                                <span>Explore City</span>
                                <span className="material-symbols-outlined text-lg animate-bounce-x">arrow_forward</span>
                            </div>
                        </div>
                    </div>

                    {/* Ha Giang - Tall Vertical */}
                    <div className="relative group md:col-span-1 md:row-span-2 rounded-[2rem] overflow-hidden cursor-pointer shadow-depth">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: "url('https://res.cloudinary.com/difdkbohi/image/upload/v1759226175/b89e3f39-1555-4e6b-a75d-002a5da47732.png')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-90 transition-opacity"></div>

                        <div className="absolute top-6 right-6 z-20">
                            <div className="bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/20 flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-sm animate-bounce-x">two_wheeler</span>
                                Loop Tour
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full z-20 transform group-hover:-translate-y-2 transition-transform duration-500">
                            <h4 className="text-white text-2xl md:text-3xl font-black drop-shadow-md mb-2">Ha Giang</h4>
                            <p className="text-white/90 text-sm font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E1F] shadow-[0_0_8px_#FF5E1F]"></span>
                                Northern Mountains
                            </p>
                        </div>
                    </div>

                    {/* Ha Long Bay - Card 3 */}
                    <div className="relative group md:col-span-1 md:row-span-1 rounded-[2rem] overflow-hidden cursor-pointer shadow-depth">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: "url('https://res.cloudinary.com/difdkbohi/image/upload/v1759226070/7e86e130-8f4a-4085-a2eb-4849fd54d68d.png')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-90 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full z-20">
                            <h4 className="text-white text-xl font-bold mb-1 drop-shadow-md">Ha Long Bay</h4>
                            <p className="text-white/80 text-xs uppercase tracking-wider font-bold">Heritage Site</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20">
                            <span className="material-symbols-outlined text-white text-sm -rotate-45">arrow_forward</span>
                        </div>
                    </div>

                    {/* Phu Yen - Card 4 */}
                    <div className="relative group md:col-span-1 md:row-span-1 rounded-[2rem] overflow-hidden cursor-pointer shadow-depth">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: "url('https://res.cloudinary.com/difdkbohi/image/upload/v1759226449/7a360276-9ef0-4345-9658-d0860c07d4a9.png')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-90 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full z-20">
                            <h4 className="text-white text-xl font-bold mb-1 drop-shadow-md">Phu Yen</h4>
                            <p className="text-white/80 text-xs uppercase tracking-wider font-bold">Coastal Paradise</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20">
                            <span className="material-symbols-outlined text-white text-sm -rotate-45">arrow_forward</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
