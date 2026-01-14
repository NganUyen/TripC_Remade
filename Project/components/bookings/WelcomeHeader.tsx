import React from 'react'

export default function WelcomeHeader() {
    return (
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between py-2">
            <div>
                <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">Chào buổi sáng,<br />Nguyễn Vũ Hoàng</h1>
                <p className="text-slate-500 max-w-md">Chào mừng bạn quay trở lại. Hãy khám phá những hành trình được cá nhân hóa dành riêng cho bạn.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <span className="material-symbols-outlined text-[#FF5E1F] mb-3">explore</span>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Quốc gia</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <span className="material-symbols-outlined text-[#FF5E1F] mb-3">luggage</span>
                    <p className="text-2xl font-bold">03</p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sắp tới</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <span className="material-symbols-outlined text-[#FF5E1F] mb-3">verified_user</span>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Ưu đãi</p>
                </div>
            </div>
        </div>
    )
}
