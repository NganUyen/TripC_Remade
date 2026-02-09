"use client"

import React, { useState } from 'react'
import { TransportPortalLayout } from './TransportPortalLayout'
import { TransportDashboard } from './TransportDashboard'

// Operations
import { FleetManagement } from './operations/FleetManagement'
import { RouteManagement } from './operations/RouteManagement'
import { DriverManagement } from './operations/DriverManagement'
import { VehicleSchedule } from './operations/VehicleSchedule'

// Bookings
import { BookingManagement } from './bookings/BookingManagement'
import { PricingManagement } from './bookings/PricingManagement'
import { SeatManagement } from './bookings/SeatManagement'

// Analytics
import { Performance } from './analytics/Performance'
import { Revenue } from './analytics/Revenue'

// Admin
import { ProviderSettings } from './admin/ProviderSettings'
import { Notifications } from './admin/Notifications'
import { Reviews } from './admin/Reviews'

export type TransportSection =
    | 'dashboard'
    // Operations
    | 'fleet' | 'routes' | 'drivers' | 'schedule'
    // Bookings
    | 'bookings' | 'pricing' | 'seats'
    // Analytics
    | 'performance' | 'revenue'
    // Admin
    | 'settings' | 'notifications' | 'reviews'

export function TransportPortal() {
    const [activeSection, setActiveSection] = useState<TransportSection>('dashboard')

    const renderContent = () => {
        switch (activeSection) {
            // Dashboard
            case 'dashboard':
                return <TransportDashboard />

            // Operations
            case 'fleet':
                return <FleetManagement />
            case 'routes':
                return <RouteManagement />
            case 'drivers':
                return <DriverManagement />
            case 'schedule':
                return <VehicleSchedule />

            // Bookings
            case 'bookings':
                return <BookingManagement />
            case 'pricing':
                return <PricingManagement />
            case 'seats':
                return <SeatManagement />

            // Analytics
            case 'performance':
                return <Performance />
            case 'revenue':
                return <Revenue />

            // Admin
            case 'settings':
                return <ProviderSettings />
            case 'notifications':
                return <Notifications />
            case 'reviews':
                return <Reviews />

            default:
                return <TransportDashboard />
        }
    }

    return (
        <TransportPortalLayout
            activeSection={activeSection}
            onSectionChange={(section) => setActiveSection(section as TransportSection)}
        >
            {renderContent()}
        </TransportPortalLayout>
    )
}
