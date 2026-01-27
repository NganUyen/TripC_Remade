import { create } from 'zustand';

interface FlyingItem {
    id: string;
    image: string;
    startRef: HTMLElement;
}

interface AnimationState {
    targetRef: React.RefObject<HTMLElement> | null;
    flyingItem: FlyingItem | null;
    setTargetRef: (ref: React.RefObject<HTMLElement>) => void;
    startAnimation: (e: React.MouseEvent | HTMLElement, image: string) => void;
    removeFlyingItem: () => void;
}

export const useCartAnimation = create<AnimationState>((set) => ({
    targetRef: null,
    flyingItem: null,
    setTargetRef: (ref) => set({ targetRef: ref }),
    startAnimation: (target, image) => {
        const startRef = target instanceof HTMLElement ? target : (target.target as HTMLElement);
        set({
            flyingItem: {
                id: Math.random().toString(),
                image,
                startRef,
            }
        });
    },
    removeFlyingItem: () => set({ flyingItem: null }),
}));
