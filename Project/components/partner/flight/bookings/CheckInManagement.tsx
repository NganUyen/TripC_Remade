'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';

export default function CheckInManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Quản lý Check-in
      </h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <UserCheck className="w-16 h-16 text-primary mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Component đang được phát triển...
        </p>
      </div>
    </div>
  );
}
