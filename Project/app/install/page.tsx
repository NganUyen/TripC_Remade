'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Download, Share, PlusSquare } from 'lucide-react';

export default function InstallPage() {
    const [url, setUrl] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setUrl(window.location.origin);
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">

                {/* Header */}
                <div className="space-y-3">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform rotate-3 mb-4">
                        <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">TripC Pro Mobile</h1>
                    <p className="text-gray-500 font-medium">Scan QR to install the app</p>
                </div>

                {/* QR Code */}
                <div className="p-4 bg-white rounded-2xl border-4 border-gray-100 shadow-inner group transition-all hover:scale-105 hover:border-blue-100 duration-300">
                    {url && (
                        <QRCodeSVG
                            value={url}
                            size={240}
                            level="H"
                            includeMargin={false}
                            className="w-full h-full"
                            imageSettings={{
                                src: "/icons/icon-192x192.png",
                                x: undefined,
                                y: undefined,
                                height: 48,
                                width: 48,
                                excavate: true,
                            }}
                        />
                    )}
                </div>

                {/* Instructions */}
                <div className="space-y-4 w-full">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Installation Guide</h3>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shadow-sm">1</div>
                            <p className="text-sm text-gray-600 leading-snug pt-1">Open your phone's <strong>Camera</strong> and scan the code.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shadow-sm">2</div>
                            <div className="text-sm text-gray-600 leading-snug pt-1">
                                Tap <Share className="w-4 h-4 inline mx-1" /> <strong>Share</strong> in your browser menu.
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shadow-sm">3</div>
                            <div className="text-sm text-gray-600 leading-snug pt-1">
                                Select <PlusSquare className="w-4 h-4 inline mx-1" /> <strong>Add to Home Screen</strong>.
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                    Works on iOS (Safari) and Android (Chrome)
                </p>
            </div>
        </div>
    );
}
