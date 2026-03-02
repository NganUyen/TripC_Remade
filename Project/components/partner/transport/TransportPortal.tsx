"use client"

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { TransportPortalLayout } from './TransportPortalLayout'
import { TransportDashboard } from './TransportDashboard'
import { TransportRegistration } from './TransportRegistration'

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
import { CommissionVoucher } from './analytics/CommissionVoucher'

// Admin
import { ProviderSettings } from './admin/ProviderSettings'
import { Notifications } from './admin/Notifications'
import { Reviews } from './admin/Reviews'

export type TransportSection =
    | 'dashboard'
    // Operations
    | 'fleet' | 'routes' | 'drivers' | 'schedule'
    // Bookings
    | 'bookings' | 'pricing' | 'seats' | 'commission'
    // Analytics
    | 'performance' | 'revenue'
    // Admin
    | 'settings' | 'notifications' | 'reviews'

export function TransportPortal() {
    const [activeSection, setActiveSection] = useState<TransportSection>('dashboard')
    const { user } = useUser()
    const [registered, setRegistered] = useState<boolean | null>(null)

    useEffect(() => {
        if (!user) return;
        fetch('/api/partner/transport/register', { headers: { 'x-user-id': user.id } })
            .then(r => r.json())
            .then(data => setRegistered(data.success === true))
            .catch(() => setRegistered(false))
    }, [user])

    if (registered === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
            </div>
        )
    }

    if (!registered) {
        return <TransportRegistration onSuccess={() => setRegistered(true)} />
    }

    const renderContent = () => {
        switch (activeSection) {
            // Dashboard
            case 'dashboard':
                return <TransportDashboard onSectionChange={(section) => setActiveSection(section as TransportSection)} />

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
            case 'commission':
                return <CommissionVoucher />

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
