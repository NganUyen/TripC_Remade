"use client"

import React, { useState } from 'react'
import { HotelPortalLayout } from './HotelPortalLayout'
import { HotelDashboard } from './HotelDashboard'

// Placeholder components - sẽ được tạo sau
const PlaceholderComponent = ({ title }: { title: string }) => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {title}
        </h1>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400">
                Component đang được phát triển...
            </p>
        </div>
    </div>
)

type Section = 
    | 'dashboard'
    | 'hotels' | 'rooms' | 'calendar' | 'availability'
    | 'bookings' | 'rate-management' | 'channel-manager'
    | 'products' | 'orders'
    | 'loyalty' | 'gamification' | 'promotions'
    | 'performance' | 'campaign-analytics'
    | 'reviews' | 'reputation'
    | 'team' | 'configuration' | 'notifications' | 'bulk-import'

export function HotelPortal() {
    const [activeSection, setActiveSection] = useState<Section>('dashboard')

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <HotelDashboard />

            // Operations
            case 'hotels':
                return <PlaceholderComponent title="Quản lý Cơ sở" />
            case 'rooms':
                return <PlaceholderComponent title="Quản lý Phòng" />
            case 'calendar':
                return <PlaceholderComponent title="Lịch vận hành" />
            case 'availability':
                return <PlaceholderComponent title="Quản lý Trống" />

            // Reservations
            case 'bookings':
                return <PlaceholderComponent title="Quản lý Đặt phòng" />
            case 'rate-management':
                return <PlaceholderComponent title="Quản lý Giá" />
            case 'channel-manager':
                return <PlaceholderComponent title="Điều phối Kênh" />

            // Commerce
            case 'products':
                return <PlaceholderComponent title="Quản lý Sản phẩm" />
            case 'orders':
                return <PlaceholderComponent title="Xử lý Đơn hàng" />

            // Marketing
            case 'loyalty':
                return <PlaceholderComponent title="Lòng trung thành" />
            case 'gamification':
                return <PlaceholderComponent title="Gamification" />
            case 'promotions':
                return <PlaceholderComponent title="Khuyến mãi" />

            // Analytics
            case 'performance':
                return <PlaceholderComponent title="Quản trị Hiệu suất" />
            case 'campaign-analytics':
                return <PlaceholderComponent title="Phân tích Chiến dịch" />

            // Feedback
            case 'reviews':
                return <PlaceholderComponent title="Quản lý Đánh giá" />
            case 'reputation':
                return <PlaceholderComponent title="Quản trị Danh tiếng" />

            // Admin
            case 'team':
                return <PlaceholderComponent title="Quản lý Đội ngũ" />
            case 'configuration':
                return <PlaceholderComponent title="Cấu hình Hệ thống" />
            case 'notifications':
                return <PlaceholderComponent title="Trung tâm Thông báo" />
            case 'bulk-import':
                return <PlaceholderComponent title="Nhập dữ liệu hàng loạt" />

            default:
                return <HotelDashboard />
        }
    }

    return (
        <HotelPortalLayout 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
        >
            {renderContent()}
        </HotelPortalLayout>
    )
}
