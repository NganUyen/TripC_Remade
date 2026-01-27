import React from 'react'
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"

interface SelectPopupProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    className?: string
}

export function SelectPopup({ isOpen, onClose, children, className = '' }: SelectPopupProps) {
    return (
        <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* 
                Anchor to the parent container. 
                This works because SelectPopup is rendered inside the relative parent.
            */}
            <PopoverAnchor className="absolute inset-0 w-full h-full pointer-events-none" />

            <PopoverContent
                align="start"
                side="bottom"
                sideOffset={8}
                avoidCollisions={false}
                className={`rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 overflow-hidden w-auto min-w-[min-content] ${className}`}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="p-4">
                    {children}
                </div>
            </PopoverContent>
        </Popover>
    )
}
