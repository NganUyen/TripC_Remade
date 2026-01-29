import React from 'react';
import { EXCHANGE_RATE_USD_VND, formatCurrency, convertUsdToVnd } from '@/lib/utils/currency';
import { AlertCircle } from 'lucide-react';

interface CurrencyConversionInfoProps {
    originalAmount: number; // USD
    sourceCurrency: string;
}

export function CurrencyConversionInfo({ originalAmount, sourceCurrency }: CurrencyConversionInfoProps) {
    if (sourceCurrency !== 'USD') return null;

    const convertedAmount = convertUsdToVnd(originalAmount);

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm flex gap-3 text-blue-700 dark:text-blue-300 items-start mt-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
                <p className="font-medium">Currency Conversion Info</p>
                <div className="mt-1 space-y-1 text-xs opacity-90">
                    <p>
                        Processing currency: <strong>VND</strong>
                    </p>
                    <p>
                        Exchange Rate: <strong>1 USD ≈ {formatCurrency(EXCHANGE_RATE_USD_VND, 'VND')}</strong>
                    </p>
                    <div className="border-t border-blue-200 dark:border-blue-800 my-1 pt-1 opacity-100 font-bold">
                        Total Charge: {formatCurrency(convertedAmount, 'VND')}
                    </div>
                </div>
            </div>
        </div>
    );
}
