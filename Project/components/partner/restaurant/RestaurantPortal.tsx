"use client"

import React, { useState } from 'react'
import { RestaurantPortalLayout } from './RestaurantPortalLayout'
import { RestaurantDashboard } from './RestaurantDashboard'

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
    const [activeSection, setActiveSection] = useState<Section>('dashboard')

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
