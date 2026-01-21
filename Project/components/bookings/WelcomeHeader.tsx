import React from 'react'

export default function WelcomeHeader() {
    return (
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between py-2">
            <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight text-slate-900 dark:text-white transition-colors">
                    Chào buổi sáng,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500">
                        Nguyễn Vũ Hoàng
                    </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md text-lg leading-relaxed">
                    Chào mừng bạn quay trở lại. Hãy khám phá những hành trình được cá nhân hóa dành riêng cho bạn.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                {[
                    { icon: 'explore', count: '24', label: 'Quốc gia' },
                    { icon: 'luggage', count: '03', label: 'Sắp tới' },
                    { icon: 'verified_user', count: '12', label: 'Ưu đãi' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <span className="material-symbols-outlined text-[#FF5E1F] mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.count}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
