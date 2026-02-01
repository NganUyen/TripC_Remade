'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function WelcomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingCode = searchParams.get('code');
    const source = searchParams.get('source');

    const benefits = [
        {
            icon: '✨',
            title: 'Quản lý đặt chỗ dễ dàng',
            description: 'Theo dõi tất cả booking của bạn tại một nơi, mọi lúc mọi nơi',
        },
        {
            icon: '💰',
            title: 'Ưu đãi độc quyền',
            description: 'Nhận giảm giá và khuyến mãi đặc biệt dành riêng cho thành viên',
        },
        {
            icon: '⚡',
            title: 'Thanh toán nhanh chóng',
            description: 'Lưu thông tin thanh toán để checkout nhanh hơn lần sau',
        },
        {
            icon: '🎯',
            title: 'Gợi ý cá nhân hóa',
            description: 'Nhận đề xuất dịch vụ phù hợp với sở thích và lịch sử của bạn',
        },
    ];

    const handleSignIn = () => {
        router.push('/sign-in?redirect_url=/my-bookings');
    };

    const handleSignUp = () => {
        router.push('/sign-up?redirect_url=/my-bookings');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
                            <svg
                                className="w-16 h-16 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Cảm ơn bạn đã đặt dịch vụ!
                        </h1>
                        {bookingCode && (
                            <div className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg">
                                <p className="text-sm font-medium">Mã booking của bạn</p>
                                <p className="text-2xl font-bold tracking-wider">{bookingCode}</p>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
                        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Khám phá thêm nhiều ưu đãi độc quyền!
                        </h2>

                        <p className="text-center text-gray-600 mb-12 text-lg">
                            Tạo tài khoản TripC để trải nghiệm đầy đủ các tính năng và nhận được nhiều ưu đãi hơn
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-shadow"
                                >
                                    <div className="text-4xl">{benefit.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                                        <p className="text-gray-600">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleSignIn}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={handleSignUp}
                                className="px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 font-bold rounded-full hover:bg-purple-50 transform hover:scale-105 transition-all"
                            >
                                Đăng ký ngay
                            </button>
                        </div>

                        <p className="text-center text-gray-500 text-sm mt-8">
                            Bạn có thể bỏ qua bước này và quay lại sau. Email xác nhận booking đã được gửi đến hộp thư của bạn.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-gray-500 text-sm">
                        <p>
                            Cần hỗ trợ?{' '}
                            <a href="mailto:support@tripc.com" className="text-purple-600 hover:underline">
                                support@tripc.com
                            </a>{' '}
                            | Hotline: 1900 xxxx
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WelcomePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            }
        >
            <WelcomeContent />
        </Suspense>
    );
}
