export function Hero() {
    return (
        <section className="relative h-[450px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
            <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFK6wEGigQgq8OQ98qr9LjNbwzOkNBQmUq6oxhQ16_9waL8OsoLH3ubCaIpFBNRAF5_0a-eXcSJF5j25knlW5bUW41FyQJW7zFbnJJ6w7st7ggZaAJjfIXYkLSngA2MNtWlQQK1c1o_S2FFOEWP2S58HQRqw-hZ-_ennq37KFk8lUDX-4gnYwL0-UYhynz_ScN46wjnUI5r2157MqNZuJBtZzGp11V76aUOqnVrCowk0twyu_QHmzVEHWdFlbvbZnU87sJ2TaTOQw"
                alt="Beautiful landscape in Vancouver"
                className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                <div className="max-w-3xl space-y-4">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
                        Your Journey Begins
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
                        Explore the world <br /><span className="text-primary-hover">your way</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 font-medium max-w-xl mx-auto drop-shadow">
                        Discover flights, hotels, and unique experiences tailored just for your lifestyle.
                    </p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-20"></div>
        </section>
    )
}
