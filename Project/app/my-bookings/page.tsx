import React from 'react'
import MembershipCard from '@/components/bookings/MembershipCard'
import WelcomeHeader from '@/components/bookings/WelcomeHeader'
import BookingTabs from '@/components/bookings/BookingTabs'
import BookingCard from '@/components/bookings/BookingCard'
import InspirationCard from '@/components/bookings/InspirationCard'
import QuickAccessLinks from '@/components/bookings/QuickAccessLinks'
import AIButton from '@/components/bookings/AIButton'

const BOOKINGS = [
  {
    id: 1,
    title: "Đỉnh Alps & Làng cổ Thụy Sĩ",
    category: "Hành trình 7 ngày 6 đêm",
    date: "15/10/2023",
    peopleCount: "02 Người",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjAV_cyS2Cjj8ly4xh3FqLW49F6ZjDHkekHy1warScBfmQRKeGjBNz0t23U1lrhqEPwuQubomDYem6Nmm7WO8T1FwQJ7lnjJVvAjqoWhZUrl0XrVeB-sgH6RsJWwowDpv_DjCnLLKJEg3bty6ixrZTvhZ8M8aQ95icKLgWIN6v22gkiEy5_dUxAfhqo9bH4yZlziQr24T1M3Pl-2IYn-y7gUeliJnnroyGL7Dc9kwcxdS0mr75p-LTAjQ-SRqxVlwio877Tto_tsY",
    status: "Đã hủy"
  },
  {
    id: 2,
    title: "Mùa thu lãng mạn tại Paris",
    category: "Luxury Getaway",
    date: "02/11/2023",
    peopleCount: "01 Người",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpCS2im1wvUEa5d8onkvN6bJLSOowRv3bWZ7turRa9ojfKuVezjEnnMoNKJRak3sBEcXgJN_M5K6_zRy7VU7Vbx1aA6dXygcGJem6_O1xhzP-uSdyddKhrRqGM9M8PR4qRkauRri54hp62DCVWmCQJLCstmJu3aCQNr16e_Yv_uR1k2UCnJ4C4mMWwf02g_aJ-tOP1b8G6j3bDpcQdu-0K9kxsdUSiTu9T9CuAbAbqthEsjxkZy2ZNK65Sn_EcTU5lbPR5nHswJIk",
    status: "Đã hủy"
  },
  {
    id: 3,
    title: "Khám phá Tokyo - Kyoto 2023",
    category: "Văn hóa & Ẩm thực",
    date: "20/12/2023",
    peopleCount: "04 Người",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYjNqRFDSdM8QArHUin5U1oAdYlzRA1nfApgogZPFgX8v0mpKuJoPVrq5vSsrBQ4WJownyEC48MLp69DiRIh95xF_wnG-yiscn9iRiwFqyuQvhKJsgqJHGG8YF6NwzNwtBcH0IuTXVVhquQ5-l4l4YsSCqK0cuEfPY3uPrYJ1i3IQgYbBe81Z2wq2CjOgeqpuCnEeTiSoPNVCi2r3Ji735HrBb1EHTsEQCwdQ4qLlmqnyAypXIwn2KXGviDTf92sFD-6HwbzFdq-U",
    status: "Đã hủy"
  }
]

export default function MyBookingsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 bg-[#F9FAFB] min-h-screen">
      <div className="asymmetric-grid mb-12">
        <MembershipCard />
        <WelcomeHeader />
      </div>
      <section className="mb-12">
        <BookingTabs />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOOKINGS.map((booking) => (
            <BookingCard
              key={booking.id}
              title={booking.title}
              category={booking.category}
              date={booking.date}
              peopleCount={booking.peopleCount}
              imageSrc={booking.imageSrc}
              status={booking.status}
            />
          ))}
        </div>
      </section>
      <div className="asymmetric-grid pb-20">
        <div className="col-span-12 lg:col-span-8">
          <InspirationCard />
        </div>
        <QuickAccessLinks />
      </div>
      <AIButton />
    </main>
  )
}
