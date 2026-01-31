"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Gift, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Segments configuration
// We need them in order to map angles.
// Total 7 segments. 360 / 7 = ~51.42 deg per segment.
const SEGMENTS = [
    { label: "50 TC", value: "50", color: "#fbbf24", probability: 40, textColor: "black" },
    { label: "100 TC", value: "100", color: "#f59e0b", probability: 30, textColor: "black" },
    { label: "500 TC", value: "500", color: "#ea580c", probability: 15, textColor: "white" },
    { label: "2K TC", value: "2000", color: "#db2777", probability: 10, textColor: "white" },
    { label: "5K TC", value: "5000", color: "#9333ea", probability: 4, textColor: "white" },
    { label: "10K TC", value: "10000", color: "#7c3aed", probability: 0.9, textColor: "white" },
    { label: "JACKPOT", value: "JACKPOT", color: "#2563eb", probability: 0.1, textColor: "white" },
];

const SPIN_DURATION = 4; // seconds total

export default function SpinWheel({ onComplete }: { onComplete?: () => void }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [canSpin, setCanSpin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const Controls = useAnimation();
    const router = useRouter();

    // Check Eligibility on Mount
    useEffect(() => {
        let mounted = true;

        async function checkStatus() {
            try {
                const res = await fetch("/api/v1/gamification/spin", { method: "GET" });
                if (res.ok) {
                    const data = await res.json();
                    if (mounted) {
                        setCanSpin(data.canSpin);
                    }
                } else {
                    // If error (e.g. 401), disable spin
                    if (mounted) setCanSpin(false);
                }
            } catch (error) {
                console.error("Failed to check spin status", error);
                if (mounted) setCanSpin(false);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        checkStatus();
        return () => { mounted = false; };
    }, []);

    // Calculate rotation to land on a specific index
    const getTargetRotation = (value: string) => {
        const index = SEGMENTS.findIndex(s => s.value === value);
        if (index === -1) return 0;

        const segmentAngle = 360 / SEGMENTS.length;
        const centerOffset = segmentAngle / 2;
        const currentCenter = (index * segmentAngle) + centerOffset;

        // We want currentCenter to be at 270 (Top).
        // Rotation needed: 270 - currentCenter.
        // Ensure positive rotation (CW spin):
        // Add 360 * 5.

        const rawTarget = 270 - currentCenter;
        const spins = 360 * 5;

        return spins + rawTarget;
    };

    const handleSpin = async () => {
        if (isSpinning || !canSpin) return;
        setIsSpinning(true);

        // 1. Start spinning visually (Generic fast spin)
        const spinPromise = Controls.start({
            rotate: 360 * 10, // Go really far
            transition: { duration: 10, ease: "linear" }
        });

        try {
            // 2. Call API (Wait for result)
            const res = await fetch("/api/v1/gamification/spin", { method: "POST" });
            const apiResult = await res.json();

            // Stop the "Linear" spin and switch to "Decelerate to Target"
            Controls.stop();

            if (!res.ok) {
                if (res.status === 429) {
                    toast.error("You've already spun today! Come back tomorrow.");
                    setCanSpin(false); // Update local state
                } else {
                    toast.error(apiResult.error || "Spin failed");
                }
                setIsSpinning(false);
                return;
            }

            // 3. Animate to validation
            const targetRotation = getTargetRotation(apiResult.rewardValue);

            await Controls.start({
                rotate: targetRotation,
                transition: { duration: SPIN_DURATION, ease: "circOut" }
            });

            // 4. Show Result
            if (apiResult.rewardType === 'NONE') {
                toast("Good luck next time!", { icon: "🍀" });
            } else {
                toast.success(apiResult.message, {
                    description: `Reward: ${apiResult.rewardValue} ${apiResult.rewardType === 'TCENT' ? 'TC' : 'Voucher'}`,
                    duration: 5000
                });
                router.refresh();
                setCanSpin(false); // Mark as spun locally
            }

            if (onComplete) onComplete();

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsSpinning(false);
        }
    };

    // Create Config for SVG
    const radius = 50; // SVG space

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg mx-auto border border-purple-100 dark:border-purple-900/20">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Lucky Day Spin
                </h3>
                <p className="text-base text-slate-500">Test your luck daily!</p>
            </div>

            {/* Wheel Container */}
            <div className="relative mb-10 w-72 h-72">
                {/* Pointer */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-slate-800 dark:text-white text-4xl drop-shadow-lg">
                    ▼
                </div>

                {/* The Wheel (SVG) */}
                <motion.div
                    animate={Controls}
                    className="w-full h-full relative"
                    style={{ transformOrigin: "center" }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {SEGMENTS.map((seg, i) => {
                            const angle = 360 / SEGMENTS.length;
                            const startAngle = i * angle;
                            const endAngle = (i + 1) * angle;

                            const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                            const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                            const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                            const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                            const pathData = `
                                M 50 50
                                L ${x1} ${y1}
                                A 50 50 0 0 1 ${x2} ${y2}
                                Z
                             `;

                            const midAngle = startAngle + angle / 2;

                            return (
                                <g key={i}>
                                    <path d={pathData} fill={seg.color} stroke="white" strokeWidth="0.5" />
                                    {/* Text Label */}
                                    <text
                                        x="50"
                                        y="50"
                                        fill={seg.textColor || "white"}
                                        fontSize="4"
                                        fontWeight="bold"
                                        alignmentBaseline="middle"
                                        textAnchor="end"
                                        transform={`rotate(${midAngle}, 50, 50) translate(46, 0)`}
                                    >
                                        {seg.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Inner Circle Overlay */}
                    <div className="absolute inset-0 m-auto w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-purple-100 dark:border-purple-900/50">
                        <Gift className="w-8 h-8 text-purple-600" />
                    </div>
                </motion.div>
            </div>

            <button
                onClick={handleSpin}
                disabled={isSpinning || isLoading || !canSpin}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSpinning ? (
                    <>
                        <Loader2 className="animate-spin w-6 h-6" /> Spinning...
                    </>
                ) : isLoading ? (
                    <>
                        <Loader2 className="animate-spin w-4 h-4" /> Checking...
                    </>
                ) : !canSpin ? (
                    <>
                        <Lock className="w-4 h-4" /> Come back tomorrow
                    </>
                ) : (
                    "SPIN NOW"
                )}
            </button>
            <p className="mt-6 text-xs text-center text-slate-400">
                1 free spin every 24 hours. T&C apply.
            </p>
        </div>
    );
}
