"use client"

import React, { useState, useEffect } from 'react'
import { RestaurantPortalLayout } from './RestaurantPortalLayout'
import { RestaurantDashboard } from './RestaurantDashboard'
import { RestaurantRegistration } from './RestaurantRegistration'
import { partnerApi } from '@/lib/partner/api'
import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

// Operations
import { MyOutlets } from './operations/MyOutlets'
import { MenuManagement } from './operations/MenuManagement'
import { TableManagement } from './operations/TableManagement'
import { KitchenDisplaySystem } from './operations/KitchenDisplaySystem'

// Orders & Revenue
import { Reservations } from './orders/Reservations'
import { OrderManagement } from './orders/OrderManagement'
import { PricingManagement } from './orders/PricingManagement'
import { FinancialReports } from './orders/FinancialReports'

// Marketing & Gamification
import { LoyaltyProgram } from './marketing/LoyaltyProgram'
import { Gamification } from './marketing/Gamification'
import { Promotions } from './marketing/Promotions'

// Inventory Management
import { StockControl } from './inventory/StockControl'
import { RecipeManagement } from './inventory/RecipeManagement'
import { StockAlerts } from './inventory/StockAlerts'

// Admin & Analytics
import { Analytics } from './admin/Analytics'
import { StaffManagement } from './admin/StaffManagement'
import { HardwareIntegration } from './admin/HardwareIntegration'

type Section =
    | 'dashboard'
    | 'outlets' | 'menu' | 'tables' | 'kitchen'
    | 'reservations' | 'order-management' | 'pricing' | 'reports'
    | 'loyalty' | 'gamification' | 'promotions'
    | 'stock' | 'recipes' | 'alerts'
    | 'analytics' | 'staff' | 'hardware'

export function RestaurantPortal() {
    const { user } = useUser()
    const [activeSection, setActiveSection] = useState<Section>('dashboard')
    const [hasVenue, setHasVenue] = useState<boolean | null>(null) // null = loading
    const [refreshKey, setRefreshKey] = useState(0) // Trigger re-check

    useEffect(() => {
        const checkVenue = async () => {
            if (!user) return
            try {
                const venues = await partnerApi.getMyVenues(user.id)
                setHasVenue(venues.length > 0)
            } catch (error) {
                console.error("Check venue failed", error)
                setHasVenue(false)
            }
        }
        checkVenue()
    }, [user, refreshKey])

    if (hasVenue === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (hasVenue === false) {
        return <RestaurantRegistration onSuccess={() => setRefreshKey(k => k + 1)} />
    }

    const renderContent = () => {
        switch (activeSection) {
            // Dashboard
            case 'dashboard':
                return <RestaurantDashboard />

            // Operations
            case 'outlets':
                return <MyOutlets />
            case 'menu':
                return <MenuManagement />
            case 'tables':
                return <TableManagement />
            case 'kitchen':
                return <KitchenDisplaySystem />

            // Orders & Revenue
            case 'reservations':
                return <Reservations />
            case 'order-management':
                return <OrderManagement />
            case 'pricing':
                return <PricingManagement />
            case 'reports':
                return <FinancialReports />

            // Marketing & Gamification
            case 'loyalty':
                return <LoyaltyProgram />
            case 'gamification':
                return <Gamification />
            case 'promotions':
                return <Promotions />

            // Inventory Management
            case 'stock':
                return <StockControl />
            case 'recipes':
                return <RecipeManagement />
            case 'alerts':
                return <StockAlerts />

            // Admin & Analytics
            case 'analytics':
                return <Analytics />
            case 'staff':
                return <StaffManagement />
            case 'hardware':
                return <HardwareIntegration />

            default:
                return <RestaurantDashboard />
        }
    }

    return (
        <RestaurantPortalLayout
            activeSection={activeSection}
            onSectionChange={setActiveSection}
        >
            {renderContent()}
        </RestaurantPortalLayout>
    )
}
