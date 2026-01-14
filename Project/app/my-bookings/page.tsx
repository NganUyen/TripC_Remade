import React from 'react'
import Image from 'next/image'

export default function MyBookingsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 bg-[#F9FAFB] min-h-screen">
      <div className="asymmetric-grid mb-12">
        <div className="col-span-12 lg:col-span-5 metallic-card rounded-[2rem] p-8 text-white flex flex-col justify-between aspect-[1.6/1] shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-1 font-semibold">Thành viên</p>
              <h2 className="text-3xl font-bold tracking-tight">PLATINUM ELITE</h2>
            </div>
            <div className="bg-white p-2 rounded-xl">
              <div className="w-12 h-12 bg-slate-900 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">qr_code_2</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">ID Thành viên</p>
                <p className="font-mono text-lg tracking-widest">8842 9901 2234</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Tích lũy</p>
                <p className="text-xl font-bold">12,450 <span className="text-sm font-normal text-white/60">Pts</span></p>
              </div>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 w-3/4 rounded-full"></div>
            </div>
          </div>
        </div>
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
      </div>
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Quản lý hành trình</h3>
            <p className="text-slate-400 text-sm">Theo dõi và quản lý các tour du lịch của bạn</p>
          </div>
          <div className="flex items-center bg-white p-1 rounded-full border border-slate-100 shadow-sm">
            <button className="px-6 py-2 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors">Đã đặt</button>
            <button className="px-6 py-2 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors">Chờ thanh toán</button>
            <button className="px-6 py-2 text-sm font-semibold bg-[#FF5E1F] text-white rounded-full shadow-md transition-shadow">Đã hủy</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="cancelled-card group bg-white border border-slate-100 rounded-[2rem] p-6 relative flex flex-col h-full overflow-hidden">
            <div className="card-content opacity-40 blur-[0.5px] transition-all duration-500">
              <div className="relative rounded-2xl overflow-hidden aspect-video mb-5">
                <Image 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjAV_cyS2Cjj8ly4xh3FqLW49F6ZjDHkekHy1warScBfmQRKeGjBNz0t23U1lrhqEPwuQubomDYem6Nmm7WO8T1FwQJ7lnjJVvAjqoWhZUrl0XrVeB-sgH6RsJWwowDpv_DjCnLLKJEg3bty6ixrZTvhZ8M8aQ95icKLgWIN6v22gkiEy5_dUxAfhqo9bH4yZlziQr24T1M3Pl-2IYn-y7gUeliJnnroyGL7Dc9kwcxdS0mr75p-LTAjQ-SRqxVlwio877Tto_tsY" 
                    alt="Swiss Alps"
                    width={400}
                    height={225}
                    className="w-full h-full object-cover grayscale-[0.5]"
                />
                <div className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">Đã hủy</div>
              </div>
              <p className="text-xs font-medium text-slate-400 mb-1">Hành trình 7 ngày 6 đêm</p>
              <h4 className="text-xl font-bold mb-2">Đỉnh Alps & Làng cổ Thụy Sĩ</h4>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  15/10/2023
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">person</span>
                  02 Người
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 relative z-10">
              <button className="rebook-btn pill-button w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm bg-white transition-all">
                <span className="material-symbols-outlined text-lg leading-none">replay</span>
                Đặt lại ngay
              </button>
            </div>
          </div>
          <div className="cancelled-card group bg-white border border-slate-100 rounded-[2rem] p-6 relative flex flex-col h-full overflow-hidden">
            <div className="card-content opacity-40 blur-[0.5px] transition-all duration-500">
              <div className="relative rounded-2xl overflow-hidden aspect-video mb-5">
                 <Image 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpCS2im1wvUEa5d8onkvN6bJLSOowRv3bWZ7turRa9ojfKuVezjEnnMoNKJRak3sBEcXgJN_M5K6_zRy7VU7Vbx1aA6dXygcGJem6_O1xhzP-uSdyddKhrRqGM9M8PR4qRkauRri54hp62DCVWmCQJLCstmJu3aCQNr16e_Yv_uR1k2UCnJ4C4mMWwf02g_aJ-tOP1b8G6j3bDpcQdu-0K9kxsdUSiTu9T9CuAbAbqthEsjxkZy2ZNK65Sn_EcTU5lbPR5nHswJIk"
                    alt="Paris"
                    width={400}
                    height={225}
                    className="w-full h-full object-cover grayscale-[0.5]"
                />
                <div className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">Đã hủy</div>
              </div>
              <p className="text-xs font-medium text-slate-400 mb-1">Luxury Getaway</p>
              <h4 className="text-xl font-bold mb-2">Mùa thu lãng mạn tại Paris</h4>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  02/11/2023
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">person</span>
                  01 Người
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 relative z-10">
              <button className="rebook-btn pill-button w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm bg-white transition-all">
                <span className="material-symbols-outlined text-lg leading-none">replay</span>
                Đặt lại ngay
              </button>
            </div>
          </div>
          <div className="cancelled-card group bg-white border border-slate-100 rounded-[2rem] p-6 relative flex flex-col h-full overflow-hidden">
            <div className="card-content opacity-40 blur-[0.5px] transition-all duration-500">
              <div className="relative rounded-2xl overflow-hidden aspect-video mb-5">
                 <Image 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYjNqRFDSdM8QArHUin5U1oAdYlzRA1nfApgogZPFgX8v0mpKuJoPVrq5vSsrBQ4WJownyEC48MLp69DiRIh95xF_wnG-yiscn9iRiwFqyuQvhKJsgqJHGG8YF6NwzNwtBcH0IuTXVVhquQ5-l4l4YsSCqK0cuEfPY3uPrYJ1i3IQgYbBe81Z2wq2CjOgeqpuCnEeTiSoPNVCi2r3Ji735HrBb1EHTsEQCwdQ4qLlmqnyAypXIwn2KXGviDTf92sFD-6HwbzFdq-U" 
                    alt="Tokyo"
                    width={400}
                    height={225}
                    className="w-full h-full object-cover grayscale-[0.5]" 
                />
                <div className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">Đã hủy</div>
              </div>
              <p className="text-xs font-medium text-slate-400 mb-1">Văn hóa & Ẩm thực</p>
              <h4 className="text-xl font-bold mb-2">Khám phá Tokyo - Kyoto 2023</h4>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  20/12/2023
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">person</span>
                  04 Người
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 relative z-10">
              <button className="rebook-btn pill-button w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm bg-white transition-all">
                <span className="material-symbols-outlined text-lg leading-none">replay</span>
                Đặt lại ngay
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="asymmetric-grid pb-20">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px] flex items-center justify-center text-center">
            <div className="relative z-10 max-w-sm">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[#FF5E1F] icon-stroke text-4xl">travel_explore</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Tìm cảm hứng mới?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Hãy để AI của TripC gợi ý những địa điểm phù hợp với sở thích du lịch của bạn.</p>
              <button className="pill-button bg-[#FF5E1F] text-white px-10 py-4 font-bold text-sm hover:shadow-[0_8px_30px_rgb(255,94,31,0.4)] transition-all">
                Khám phá ngay
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] select-none pointer-events-none">
              <span className="material-symbols-outlined text-[20rem]">map</span>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-lg font-bold px-2">Truy cập nhanh</h3>
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-[#FF5E1F]/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF5E1F] flex items-center justify-center group-hover:bg-[#FF5E1F] group-hover:text-white transition-all">
              <span className="material-symbols-outlined icon-stroke text-2xl">hotel</span>
            </div>
            <div>
              <p className="font-bold">Khách sạn</p>
              <p className="text-xs text-slate-400">Ưu đãi đến 40%</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#FF5E1F] transition-colors">chevron_right</span>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-[#FF5E1F]/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
              <span className="material-symbols-outlined icon-stroke text-2xl">flight</span>
            </div>
            <div>
              <p className="font-bold">Chuyến bay</p>
              <p className="text-xs text-slate-400">Vé rẻ mỗi ngày</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-blue-500 transition-colors">chevron_right</span>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-[#FF5E1F]/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
              <span className="material-symbols-outlined icon-stroke text-2xl">auto_fix_high</span>
            </div>
            <div>
              <p className="font-bold">Lên kế hoạch AI</p>
              <p className="text-xs text-slate-400">Tối ưu lịch trình</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-purple-500 transition-colors">chevron_right</span>
          </div>
        </div>
      </div>
      <button className="fixed bottom-8 right-8 w-16 h-16 pill-button bg-[#FF5E1F] shadow-[0_8px_30px_rgb(255,94,31,0.4)] flex items-center justify-center text-white z-50 hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
      </button>
    </main>
  )
}
