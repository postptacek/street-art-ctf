import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Eat animation component for the about page
function EatAnimation() {
    const [frame, setFrame] = useState(0)
    const [currentVariant, setCurrentVariant] = useState('a')
    const totalFrames = 41

    useEffect(() => {
        const interval = setInterval(() => {
            setFrame(f => {
                const nextFrame = f + 1
                if (nextFrame >= totalFrames) {
                    setCurrentVariant(v => v === 'a' ? 'b' : 'a')
                    return 0
                }
                return nextFrame
            })
        }, 50)
        return () => clearInterval(interval)
    }, [])

    const frameNumber = String(frame).padStart(5, '0')
    const imagePath = `${import.meta.env.BASE_URL}animation/eat_${currentVariant}/eat_${currentVariant}_${frameNumber}.png`

    return (
        <img
            src={imagePath}
            alt="Chomp eating"
            className="w-full h-full object-contain"
        />
    )
}

export default function About() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-nohemi overflow-y-auto">
            {/* Hero Section */}
            <div className="relative h-screen flex flex-col items-center justify-center p-8">
                {/* Animated background elements */}
                <motion.div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-16 h-16 opacity-10"
                            style={{
                                left: `${10 + (i * 12)}%`,
                                top: `${20 + (i % 3) * 25}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 3 + i * 0.5,
                                repeat: Infinity,
                                delay: i * 0.3,
                            }}
                        >
                            <img
                                src={`${import.meta.env.BASE_URL}chumper.png`}
                                alt=""
                                className="w-full h-full object-contain grayscale"
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center z-10"
                >
                    <motion.p
                        className="text-sm tracking-widest text-black/40 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        PASTE-UP STREET ART PROJECT
                    </motion.p>

                    <motion.h1
                        className="text-6xl md:text-8xl font-black text-black tracking-tight mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        CHOMP
                    </motion.h1>

                    <motion.p
                        className="text-xl text-black/60 max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Eating the ads, one wall at a time.
                    </motion.p>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <span className="text-black/30 text-sm">↓ Scroll</span>
                </motion.div>
            </div>

            {/* What is Chomp Section */}
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black text-white">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-2xl text-center"
                >
                    <p className="text-sm tracking-widest text-white/40 mb-6">WHAT IS CHOMP?</p>

                    <div className="w-48 h-48 mx-auto mb-8">
                        <EatAnimation />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        A paste-up character eating through the city
                    </h2>

                    <p className="text-white/60 text-lg leading-relaxed mb-8">
                        Prague doesn't have much paste-up street art. We're changing that.
                        Chomp is a character that can be found hidden throughout the city —
                        on walls, lampposts, electrical boxes — always hungry, always eating.
                    </p>

                    <p className="text-white/60 text-lg leading-relaxed">
                        What's Chomp eating? <span className="text-white font-bold">Ads.</span> Billboards.
                        Posters. The visual noise that clutters our streets. Chomp devours them all.
                    </p>
                </motion.div>
            </div>

            {/* The Game Section */}
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-2xl text-center"
                >
                    <p className="text-sm tracking-widest text-black/40 mb-6">THE GAME</p>

                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                        Hunt. Scan. Capture.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-6 bg-white border-2 border-black"
                        >
                            <div className="w-12 h-12 mb-4 mx-auto border-2 border-black flex items-center justify-center">
                                <span className="text-xl font-black">1</span>
                            </div>
                            <h3 className="font-bold text-black mb-2">EXPLORE</h3>
                            <p className="text-black/60 text-sm">Walk the streets and find Chomp paste-ups hidden in plain sight.</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-6 bg-white border-2 border-black"
                        >
                            <div className="w-12 h-12 mb-4 mx-auto border-2 border-black flex items-center justify-center">
                                <span className="text-xl font-black">2</span>
                            </div>
                            <h3 className="font-bold text-black mb-2">SCAN</h3>
                            <p className="text-black/60 text-sm">Use AR to scan and discover the hidden Chomp character in each location.</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-6 bg-white border-2 border-black"
                        >
                            <div className="w-12 h-12 mb-4 mx-auto border-2 border-black flex items-center justify-center">
                                <span className="text-xl font-black">3</span>
                            </div>
                            <h3 className="font-bold text-black mb-2">BATTLE</h3>
                            <p className="text-black/60 text-sm">Join a team. Capture territories. Compete for control of the city.</p>
                        </motion.div>
                    </div>

                    <p className="text-black/60 text-lg">
                        Two teams. <span className="text-[#E53935] font-bold">Red</span> vs <span className="text-[#1E88E5] font-bold">Blue</span>.
                        Every Chomp you find is a territory to claim.
                    </p>
                </motion.div>
            </div>

            {/* Paste-Up Culture Section */}
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black text-white">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-2xl text-center"
                >
                    <p className="text-sm tracking-widest text-white/40 mb-6">PASTE-UP CULTURE</p>

                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Art on the streets, not in galleries
                    </h2>

                    <p className="text-white/60 text-lg leading-relaxed mb-8">
                        Paste-up is a form of street art where images are drawn or painted on paper,
                        then pasted to surfaces using wheat paste or wallpaper glue.
                        It's fast, accessible, and ephemeral — here today, gone tomorrow.
                    </p>

                    <p className="text-white/60 text-lg leading-relaxed mb-8">
                        Unlike graffiti, paste-ups can be created anywhere and installed quickly.
                        They become part of the urban landscape, weathering and fading with time,
                        interacting with their environment.
                    </p>

                    <p className="text-white/40 text-sm italic">
                        "The street is the largest gallery in the world."
                    </p>
                </motion.div>
            </div>

            {/* Find Chomp Section */}
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-2xl text-center"
                >
                    <p className="text-sm tracking-widest text-black/40 mb-6">JOIN THE HUNT</p>

                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                        Find Chomp
                    </h2>

                    <p className="text-black/60 text-lg mb-8">
                        Chomp paste-ups are scattered across two main regions —
                        <span className="text-black font-bold"> Praha</span> (Centrum, Palmovka, Vysočany, Karlín, Libeň)
                        and <span className="text-black font-bold">Poděbrady</span>, a spa town east of Prague.
                    </p>

                    <motion.div
                        className="w-32 h-32 mx-auto mb-8"
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}chumper.png`}
                            alt="Chomp"
                            className="w-full h-full object-contain"
                        />
                    </motion.div>

                    <p className="text-black/40 text-sm">
                        Open your eyes. Chomp is hungry.
                    </p>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="p-8 text-center border-t border-black/10">
                <motion.a
                    href="#/"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block bg-black text-white font-bold text-lg px-12 py-4 mb-6"
                >
                    PLAY
                </motion.a>
                <p className="text-black/40 text-sm">
                    A street art project by <span className="text-black font-bold">PTACEK</span>
                </p>
            </div>
        </div>
    )
}
