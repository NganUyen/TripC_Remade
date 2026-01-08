'use client'

export function BeautyHero() {
    return (
        <section className="relative w-full h-[55vh] min-h-[450px] max-h-[600px] flex items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDmpLRqI9NKREVJXYotrfFChiS6XUvIKbNdlYY4woB39jicugETGrOK__kgUk1VVBoj3ytX9dQa_MDVwdj0gjAiTG1vG-tppC_Ml0WWaZ_19V94RcIiWOrNOMc0VSKxyj4iYgW3oVAIGwlUyPESwMhjMWKV96AFmwIJSgMmSmuqfj312oMv60i2ocCSCS_KWk8jiy5Ynqq0Rsn4GMP5zJx9D5Z6tvlYEJnl8dOu4HFKtFCBV3nDL_yOcSgx6nxAiCOG5KIVHrWFiFE')" }}
            >
            </div>
            <div className="absolute inset-0 z-0 bg-black/40"></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
            <div className="relative z-10 px-4 w-full max-w-4xl mx-auto flex flex-col items-center gap-6 text-center animate-fade-in mt-8">
                <h1 className="text-white text-4xl md:text-6xl font-black tracking-tight leading-[1.1] drop-shadow-md">
                    Indulge in Beauty <br className="hidden md:block" /> & Pampering
                </h1>
                <p className="text-white/90 text-lg font-medium max-w-2xl leading-relaxed drop-shadow-sm">
                    Discover top-rated salons, spas, and treatments curated just for you.
                </p>
                <div className="w-full max-w-2xl relative mt-2">
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-slate-400 material-symbols-outlined">search</span>
                        <input
                            className="w-full pl-12 pr-4 py-4 rounded-full border-none shadow-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 text-base outline-none h-14"
                            placeholder="Search treatments, salons, locations..."
                            type="text"
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary-dark text-white px-6 rounded-full font-bold text-sm transition-all shadow-md h-10 flex items-center">
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
