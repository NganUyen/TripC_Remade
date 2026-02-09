"use client"

import React, { useState } from 'react'
import { HotelPortalLayout } from './HotelPortalLayout'
import { HotelDashboard } from './HotelDashboard'

// Properties
import { HotelList } from './properties/HotelList'
import { HotelDetails } from './properties/HotelDetails'

// Rooms
import { RoomTypes } from './rooms/RoomTypes'
import { RoomInventory } from './rooms/RoomInventory'

// Rates
import { RateCalendar } from './rates/RateCalendar'
import { RateManagement } from './rates/RateManagement'
import { BulkUpdate } from './rates/BulkUpdate'

// Bookings
import { BookingList } from './bookings/BookingList'
import { BookingCalendar } from './bookings/BookingCalendar'
import { CheckInOut } from './bookings/CheckInOut'

// Analytics
import { DashboardMetrics } from './analytics/DashboardMetrics'
import { RevenueReport } from './analytics/RevenueReport'
import { OccupancyReport } from './analytics/OccupancyReport'
import { FinancialReports } from './analytics/FinancialReports'

// Reviews
import { ReviewsList } from './reviews/ReviewsList'
import { RespondReviews } from './reviews/RespondReviews'

// Settings
import { AccountSettings } from './settings/AccountSettings'
import { NotificationSettings } from './settings/NotificationSettings'
import { PayoutSettings } from './settings/PayoutSettings'

type Section = 
    | 'dashboard'
    | 'hotel-list' | 'hotel-details'
    | 'room-types' | 'room-inventory'
    | 'rate-calendar' | 'rate-management' | 'bulk-update'
    | 'booking-list' | 'booking-calendar' | 'check-in-out'
    | 'dashboard-metrics' | 'revenue-report' | 'occupancy-report' | 'financial-reports'
    | 'reviews-list' | 'respond-reviews'
    | 'account-settings' | 'notification-settings' | 'payout-settings'

export function HotelPortal() {
    const [activeSection, setActiveSection] = useState<Section>('dashboard')
    
    // TODO: Replace with actual partner ID from authentication
    // This is a mock partner ID for development without auth
    const partnerId = '00000000-0000-0000-0000-000000000001'

    const renderContent = () => {
        switch (activeSection) {
            // Dashboard
            case 'dashboard':
                return <HotelDashboard />

            // Properties
            case 'hotel-list':
                return <HotelList partnerId={partnerId} />
            case 'hotel-details':
                return <HotelDetails />

            // Rooms
            case 'room-types':
                return <RoomTypes />
            case 'room-inventory':
                return <RoomInventory />

            // Rates
            case 'rate-calendar':
                return <RateCalendar />
            case 'rate-management':
                return <RateManagement />
            case 'bulk-update':
                return <BulkUpdate />

            // Bookings
            case 'booking-list':
                return <BookingList partnerId={partnerId} />
            case 'booking-calendar':
                return <BookingCalendar />
            case 'check-in-out':
                return <CheckInOut />

            // Analytics
            case 'dashboard-metrics':
                return <DashboardMetrics />
            case 'revenue-report':
                return <RevenueReport />
            case 'occupancy-report':
                return <OccupancyReport />
            case 'financial-reports':
                return <FinancialReports />

            // Reviews
            case 'reviews-list':
                return <ReviewsList />
            case 'respond-reviews':
                return <RespondReviews />

            // Settings
            case 'account-settings':
                return <AccountSettings />
            case 'notification-settings':
                return <NotificationSettings />
            case 'payout-settings':
                return <PayoutSettings />

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
