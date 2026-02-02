"use client";

import { MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface BuyerInfoSectionProps {
  className?: string;
}

export const BuyerInfoSection = ({ className }: BuyerInfoSectionProps) => {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
          Shipping Address
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          Edit
        </Button>
      </div>

      {/* Address Row */}
      <div className="group flex items-start gap-4 py-2">
        {/* Icon - Minimal */}
        <div className="mt-1 text-slate-400">
          <MapPin className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-slate-900 dark:text-white">
              Home
            </span>
            <span className="text-xs text-slate-400 font-normal">Default</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            123 Nguyen Hue Street, Ben Nghe Ward
            <br />
            District 1, Ho Chi Minh City
          </p>
          <p className="text-sm text-slate-500">John Doe • +84 90 123 4567</p>
        </div>
      </div>

      <button
        type="button"
        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add New Address
      </button>
    </section>
  );
};
