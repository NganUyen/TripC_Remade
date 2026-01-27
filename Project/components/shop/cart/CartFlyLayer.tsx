"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartAnimation } from "@/store/useCartAnimation";

export const CartFlyLayer = () => {
    const { targetRef, flyingItem, removeFlyingItem } = useCartAnimation();
    const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);

    const updateTargetPos = useCallback(() => {
        // First try using the ref
        if (targetRef?.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setTargetPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            return;
        }
        
        // Fallback: find cart icon by ID in the DOM
        const cartIcon = document.getElementById('cart-icon-target');
        if (cartIcon) {
            const rect = cartIcon.getBoundingClientRect();
            setTargetPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            return;
        }

        // Ultimate fallback: top-right corner of screen (where cart icon usually is)
        setTargetPos({ x: window.innerWidth - 100, y: 40 });
    }, [targetRef]);

    useEffect(() => {
        updateTargetPos();
    }, [targetRef, flyingItem, updateTargetPos]);

    // Don't render animation if we don't have a valid target position yet
    if (!targetPos) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            <AnimatePresence>
                {flyingItem && (
                    <FlyingItem
                        key={flyingItem.id}
                        item={flyingItem}
                        targetPos={targetPos}
                        onComplete={removeFlyingItem}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const FlyingItem = ({ item, targetPos, onComplete }: any) => {
    const [startPos] = useState(() => {
        const rect = item.startRef?.getBoundingClientRect();
        return rect
            ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
            : { x: window.innerWidth / 2, y: window.innerHeight / 2, width: 50, height: 50 };
    });

    return (
        <motion.div
            initial={{
                opacity: 1,
                x: startPos.x,
                y: startPos.y,
                width: startPos.width,
                height: startPos.height,
                scale: 1,
            }}
            animate={{
                opacity: 0,
                x: targetPos.x,
                y: targetPos.y,
                width: 20,
                height: 20,
                scale: 0.2,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
            className="absolute rounded-lg overflow-hidden shadow-xl z-[100]"
        >
            {item.image ? (
                <img src={item.image} alt="" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-[#FF5E1F]" />
            )}
        </motion.div>
    );
};
