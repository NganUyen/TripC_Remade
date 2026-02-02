"use client";

import { Info } from "lucide-react";
import type { EntertainmentItemDetail } from "@/lib/hooks/useEntertainmentAPI";

interface EntertainmentDetailsProps {
  item: EntertainmentItemDetail;
}

export function EntertainmentDetails({ item }: EntertainmentDetailsProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          About This Event
        </h3>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {item.metadata?.long_description ||
            item.long_description ||
            item.description}
        </p>
        {(item.features || item.metadata?.features) &&
          (item.features || item.metadata?.features)!.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">
                Features
              </h4>
              <ul className="space-y-2">
                {(item.features || item.metadata?.features || []).map(
                  (feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {feature}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}
