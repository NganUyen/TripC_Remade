export function EventsHero() {
    return (
        <div className="relative w-full h-[380px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbiQN06O4x4WxroiMpdu7oBzYg3czJx2UMMESlgekufYnqiUH27pKpTmMzKvs1q2qinIhtWR2NctyFh7Rrs0bhbYbqfF3mqZ6yDaG-UpTy9vGM-jVkv_Sm8K3s4pUd1iDcLbS07jCQqEtPHzUgYm8nEzaceEZ7f9fCONzlsqnafyC7qs8NMk3OrGaxNnhSX2C0_PFGNh6wVRPRvKiduZDkASGU-muiJGjejF1JdxqduBV3KO2hblqZDarJnaLDSn_HiP42wuYTiuY"
                    alt="Concert Crowd"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background-light dark:to-background-dark"></div>
            </div>
            <div className="relative z-10 text-center w-full max-w-4xl px-4 flex flex-col items-center animate-fade-in-up">
                <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                    Tickets & Experiences
                </h1>
                <p className="text-slate-200 text-lg md:text-xl mb-6 max-w-2xl mx-auto font-light drop-shadow-md">
                    Find tickets to attractions, tours, and local experiences
                </p>
            </div>
        </div>
    )
}
