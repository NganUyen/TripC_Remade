# Dining Module - Backend Documentation

## Tổng quan

Module Dining được thiết kế với phong cách **modular** và **loose coupling**, cho phép tích hợp dễ dàng vào hệ thống hiện tại mà không ảnh hưởng đến các module khác.

## Cấu trúc thư mục

```
lib/dining/
├── index.ts              # File trung tâm - export tất cả public APIs
├── types.ts              # Type definitions cho Dining module
├── api.ts                # Client-side API utilities (cho React components)
├── services/             # Service layer - business logic
│   ├── venueService.ts   # Quản lý venues/restaurants
│   ├── menuService.ts    # Quản lý menus và menu items
│   └── reservationService.ts  # Quản lý reservations
└── README.md             # File này
```

## Database Schema

Module Dining sử dụng các bảng sau (đã được tạo trong migrations 001-005):

- `dining_venues` - Thông tin nhà hàng
- `dining_menus` - Menu categories
- `dining_menu_items` - Món ăn trong menu
- `dining_tables` - Bàn trong nhà hàng
- `dining_reservations` - Đặt bàn
- `dining_time_slots` - Khung giờ đặt bàn
- `dining_blocked_dates` - Ngày đóng cửa

## API Endpoints

### Venues (Nhà hàng)

#### GET `/api/dining/venues`
Lấy danh sách nhà hàng với filters

**Query Parameters:**
- `city` - Lọc theo thành phố
- `district` - Lọc theo quận/huyện
- `cuisine_type` - Lọc theo loại ẩm thực (comma-separated)
- `price_range` - Lọc theo giá (budget, moderate, upscale, fine_dining)
- `min_rating` - Đánh giá tối thiểu
- `is_featured` - Chỉ lấy featured venues
- `search` - Tìm kiếm theo tên/mô tả
- `limit` - Số lượng kết quả (default: 20)
- `offset` - Offset cho pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "venues": [...],
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

#### GET `/api/dining/venues/[id]`
Lấy thông tin chi tiết một nhà hàng

#### GET `/api/dining/venues/slug/[slug]`
Lấy nhà hàng theo slug

#### GET `/api/dining/venues/featured`
Lấy danh sách featured venues

#### POST `/api/dining/venues`
Tạo nhà hàng mới

**Body:**
```json
{
  "name": "Tên nhà hàng",
  "description": "Mô tả",
  "address": "Địa chỉ",
  "city": "Thành phố",
  "cuisine_type": ["Vietnamese", "Asian"],
  "price_range": "moderate",
  ...
}
```

#### PUT `/api/dining/venues/[id]`
Cập nhật thông tin nhà hàng

#### DELETE `/api/dining/venues/[id]`
Xóa nhà hàng (soft delete)

### Menus

#### GET `/api/dining/menus?venue_id=xxx`
Lấy danh sách menu của một nhà hàng

#### GET `/api/dining/menus/items?venue_id=xxx&menu_id=xxx&featured=true`
Lấy menu items

**Query Parameters:**
- `venue_id` - Lấy tất cả items của venue
- `menu_id` - Lấy items của một menu cụ thể
- `featured` - Chỉ lấy featured items

### Reservations

#### POST `/api/dining/reservations`
Tạo reservation mới

**Body:**
```json
{
  "venue_id": "uuid",
  "reservation_date": "2026-01-30",
  "reservation_time": "19:30",
  "guest_count": 2,
  "guest_name": "Tên khách",
  "guest_phone": "0123456789",
  "guest_email": "email@example.com",
  "special_requests": "Yêu cầu đặc biệt",
  "occasion": "birthday",
  "dietary_restrictions": ["vegetarian"]
}
```

#### GET `/api/dining/reservations?user_id=xxx`
Lấy reservations của user

#### GET `/api/dining/reservations?venue_id=xxx&date=2026-01-30`
Lấy reservations của venue trong một ngày

#### GET `/api/dining/reservations/[id]`
Lấy chi tiết reservation

#### PUT `/api/dining/reservations/[id]`
Cập nhật reservation (chủ yếu để update status)

**Body:**
```json
{
  "status": "confirmed",
  "confirmed_by": "staff_id"
}
```

#### DELETE `/api/dining/reservations/[id]`
Hủy reservation

#### GET `/api/dining/reservations/check?venue_id=xxx&date=2026-01-30&time=19:30&guest_count=2`
Kiểm tra availability

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

## Sử dụng trong Frontend

### Import từ module

```typescript
// Import types
import type { DiningVenue, DiningReservation } from '@/lib/dining'

// Import services (server-side only)
import { venueService, reservationService } from '@/lib/dining'

// Import client API (for React components)
import { diningApi } from '@/lib/dining/api'
```

### Ví dụ sử dụng trong Component

```typescript
"use client"

import { useEffect, useState } from 'react'
import { diningApi } from '@/lib/dining/api'
import type { DiningVenue } from '@/lib/dining/types'

export function RestaurantList() {
  const [venues, setVenues] = useState<DiningVenue[]>([])

  useEffect(() => {
    async function fetchVenues() {
      const result = await diningApi.getVenues({ limit: 10 })
      setVenues(result.venues)
    }
    fetchVenues()
  }, [])

  return (
    <div>
      {venues.map(venue => (
        <div key={venue.id}>{venue.name}</div>
      ))}
    </div>
  )
}
```

## Cấu hình

### Environment Variables

Thêm vào `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional, for admin operations
```

### Database Setup

1. Chạy các migration files từ `DB/001.sql` đến `DB/005.sql` trên Supabase
2. Đảm bảo các bảng đã được tạo thành công
3. Kiểm tra RLS (Row Level Security) policies nếu cần

## Testing

Xem file `DINING_TEST_GUIDE.md` ở thư mục gốc để biết hướng dẫn test chi tiết.

## Lưu ý

1. **Authentication**: Hiện tại API routes sử dụng header `x-user-id` để lấy user ID. Bạn cần implement authentication middleware để lấy user ID từ session/token thực tế.

2. **Error Handling**: Tất cả services đều có error handling cơ bản. Bạn có thể mở rộng để phù hợp với yêu cầu của project.

3. **RLS Policies**: Nếu sử dụng Supabase RLS, cần tạo policies phù hợp cho các bảng Dining.

4. **Pagination**: API hỗ trợ pagination thông qua `limit` và `offset` parameters.

## Tích hợp với các module khác

Module Dining được thiết kế để:
- **Độc lập**: Có thể hoạt động mà không cần các module khác
- **Tích hợp dễ dàng**: Có thể kết nối với `bookings` table thông qua `booking_id` trong `dining_reservations`
- **Mở rộng**: Dễ dàng thêm features mới mà không ảnh hưởng code hiện tại

## Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team hoặc xem documentation trong code comments.
