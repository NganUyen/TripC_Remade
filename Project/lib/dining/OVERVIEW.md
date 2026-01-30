# Dining Module - Tổng quan

## Kiến trúc Module

Module Dining được thiết kế theo nguyên tắc **Modular** và **Loose Coupling**:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Components                  │
│  (components/dining/*.tsx)                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Client API Layer                            │
│  (lib/dining/api.ts)                                    │
│  - diningApi.getVenues()                                │
│  - diningApi.createReservation()                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes                          │
│  (app/api/dining/**/*.ts)                               │
│  - /api/dining/venues                                    │
│  - /api/dining/menus                                    │
│  - /api/dining/reservations                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Service Layer                              │
│  (lib/dining/services/*.ts)                             │
│  - venueService                                         │
│  - menuService                                          │
│  - reservationService                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Database (Supabase)                        │
│  - dining_venues                                        │
│  - dining_menus                                         │
│  - dining_menu_items                                    │
│  - dining_reservations                                  │
│  - dining_tables                                        │
│  - dining_time_slots                                    │
│  - dining_blocked_dates                                │
└─────────────────────────────────────────────────────────┘
```

## File trung tâm: `lib/dining/index.ts`

File này là **hub kết nối** tất cả các phần của module:

```typescript
// Export tất cả types
export * from './types'

// Export services
export { venueService, VenueService } from './services/venueService'
export { menuService, MenuService } from './services/menuService'
export { reservationService, ReservationService } from './services/reservationService'

// Re-export types cho convenience
export type { DiningVenue, DiningReservation, ... } from './types'
```

**Cách sử dụng:**
```typescript
// Import từ file trung tâm
import { venueService, type DiningVenue } from '@/lib/dining'
```

## Luồng dữ liệu

### 1. Frontend → Backend

```
Component (React)
    ↓
diningApi.getVenues()  [lib/dining/api.ts]
    ↓
GET /api/dining/venues  [app/api/dining/venues/route.ts]
    ↓
venueService.searchVenues()  [lib/dining/services/venueService.ts]
    ↓
Supabase Database
```

### 2. Backend → Frontend

```
Supabase Database
    ↓
venueService.searchVenues()  [Returns DiningVenue[]]
    ↓
API Route  [Returns JSON response]
    ↓
diningApi.getVenues()  [Returns VenueListResponse]
    ↓
Component State Update
```

## Các thành phần chính

### 1. Types (`lib/dining/types.ts`)
- Định nghĩa tất cả interfaces và types
- Request/Response types cho API
- Shared types cho toàn module

### 2. Services (`lib/dining/services/`)
- **venueService**: Quản lý venues (CRUD, search, filter)
- **menuService**: Quản lý menus và menu items
- **reservationService**: Quản lý reservations (create, update, check availability)

### 3. API Routes (`app/api/dining/`)
- RESTful API endpoints
- Xử lý HTTP requests/responses
- Validation và error handling

### 4. Client API (`lib/dining/api.ts`)
- Wrapper functions cho React components
- Type-safe API calls
- Error handling

### 5. Frontend Components (`components/dining/`)
- UI components sử dụng `diningApi`
- Hiển thị data từ backend
- User interactions

## Tích hợp với hệ thống hiện tại

### Không ảnh hưởng đến code khác
- Module độc lập trong `lib/dining/`
- API routes riêng trong `app/api/dining/`
- Components riêng trong `components/dining/`

### Kết nối với database team
- Sử dụng `users.clerk_id` format cho `user_id`
- Có thể link với `bookings` table qua `booking_id` (optional)
- Không conflict với các bảng khác

### Mở rộng dễ dàng
- Thêm service mới: Tạo file trong `services/`
- Thêm API endpoint: Tạo route trong `app/api/dining/`
- Thêm type: Thêm vào `types.ts`

## Best Practices

1. **Luôn import từ file trung tâm**: `@/lib/dining`
2. **Sử dụng types**: Luôn type-safe với TypeScript
3. **Error handling**: Services đã có error handling cơ bản
4. **Modularity**: Mỗi service chỉ làm một việc
5. **Loose coupling**: Services không phụ thuộc vào nhau

## Ví dụ sử dụng

### Trong Component:
```typescript
import { diningApi } from '@/lib/dining/api'
import type { DiningVenue } from '@/lib/dining/types'

const venues = await diningApi.getVenues({ city: 'Da Nang' })
```

### Trong API Route:
```typescript
import { venueService } from '@/lib/dining'

const venues = await venueService.searchVenues(params)
```

### Trong Service:
```typescript
import { createServerClient } from '@/lib/supabase'

const supabase = createServerClient()
// Use supabase client directly
```

## File Structure Summary

```
Project/
├── lib/
│   ├── supabase.ts                    # Supabase client setup
│   └── dining/                        # Dining module
│       ├── index.ts                   # ⭐ File trung tâm
│       ├── types.ts                   # Type definitions
│       ├── api.ts                     # Client API utilities
│       ├── services/                  # Service layer
│       │   ├── venueService.ts
│       │   ├── menuService.ts
│       │   └── reservationService.ts
│       ├── README.md                  # Documentation
│       └── OVERVIEW.md                # File này
├── app/
│   └── api/
│       └── dining/                    # API routes
│           ├── venues/
│           ├── menus/
│           └── reservations/
└── components/
    └── dining/                        # Frontend components
        ├── RestaurantList.tsx
        ├── RestaurantHero.tsx
        ├── ReservationSidebar.tsx
        └── ...
```

## Next Steps

1. ✅ Database schema đã được tạo
2. ✅ Backend services đã được implement
3. ✅ API routes đã được tạo
4. ✅ Frontend components đã được cập nhật
5. ⏳ Cần cấu hình Supabase credentials
6. ⏳ Cần test toàn bộ flow
7. ⏳ Cần integrate authentication thực tế

Xem `DINING_TEST_GUIDE.md` để biết cách test hệ thống.
