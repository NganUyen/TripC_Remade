# Beauty Module - Backend Documentation

## Tổng quan

Module Beauty được thiết kế với phong cách **modular** và **loose coupling** (tương tự Dining), cho phép tích hợp dễ dàng vào hệ thống mà không ảnh hưởng đến các module khác.

## Cấu trúc thư mục

```
lib/beauty/
├── index.ts              # File trung tâm - export tất cả public APIs
├── types.ts              # Type definitions cho Beauty module
├── api.ts                # Client-side API utilities (cho React components)
├── supabaseServerClient.ts  # Supabase client server-side (service role)
├── services/             # Service layer - business logic
│   ├── venueService.ts   # Quản lý venues (salon/spa)
│   ├── serviceService.ts   # Quản lý beauty services
│   └── appointmentService.ts  # Quản lý appointments
├── OVERVIEW.md           # Kiến trúc tổng quan
└── README.md             # File này
```

## Database Schema

Module Beauty sử dụng các bảng sau (migrations 006–008):

- `beauty_venues` – Thông tin salon/spa
- `beauty_services` – Dịch vụ (hair, nail, facial, massage…)
- `beauty_appointments` – Đặt lịch hẹn

## API Endpoints

### Venues (Salon / Spa)

#### GET `/api/beauty/venues`
Lấy danh sách venues với filters.

**Query Parameters:**
- `city`, `district` – Lọc theo địa điểm
- `categories` – Comma-separated
- `price_range` – budget, moderate, premium, luxury
- `min_rating` – Đánh giá tối thiểu
- `is_featured` – Chỉ lấy featured
- `search` – Tìm theo tên/mô tả
- `limit`, `offset` – Pagination

#### GET `/api/beauty/venues/[id]`
Chi tiết một venue.

#### GET `/api/beauty/venues/slug/[slug]`
Lấy venue theo slug.

#### GET `/api/beauty/venues/featured?limit=10`
Danh sách featured venues.

#### GET `/api/beauty/venues/[id]/availability?date=YYYY-MM-DD&service_id=xxx`
Lấy **slot giờ trống** trong ngày (theo `operating_hours` và lịch đã đặt). `service_id` tùy chọn → dùng duration của service để tính slot.

#### POST `/api/beauty/venues`
Tạo venue mới.

#### PUT `/api/beauty/venues/[id]`
Cập nhật venue.

#### DELETE `/api/beauty/venues/[id]`
Xóa venue.

### Services (Dịch vụ)

#### GET `/api/beauty/services`
Lấy danh sách dịch vụ.

**Query Parameters:**
- `venue_id` – Lọc theo venue
- `category` – Loại dịch vụ
- `is_featured` – Chỉ featured
- `limit`, `offset`

#### GET `/api/beauty/services/[id]`
Chi tiết một dịch vụ.

#### GET `/api/beauty/services/featured?venue_id=xxx&limit=10`
Dịch vụ featured (có thể theo venue).

#### GET `/api/beauty/services/top-rated?limit=10`
Dịch vụ top-rated.

#### GET `/api/beauty/services/listing?limit=20`
Danh sách dịch vụ kèm thông tin venue (dùng cho listing trang Beauty).

### Appointments (Đặt lịch)

#### POST `/api/beauty/appointments`
Tạo appointment mới.

**Body:**
```json
{
  "venue_id": "uuid",
  "service_id": "uuid",
  "appointment_date": "2026-01-30",
  "appointment_time": "14:00",
  "duration_minutes": 90,
  "guest_name": "Tên khách",
  "guest_phone": "0123456789",
  "guest_email": "email@example.com",
  "special_requests": "Ghi chú"
}
```

#### GET `/api/beauty/appointments?user_id=xxx`
Lấy appointments của user.

#### GET `/api/beauty/appointments/[id]`
Chi tiết appointment.

#### DELETE `/api/beauty/appointments/[id]`
Hủy appointment (có thể truyền `?reason=...`).

## Sử dụng trong Frontend

### Import từ module

```typescript
// Types
import type { BeautyVenue, BeautyService, BeautyAppointment } from '@/lib/beauty'

// Client API (React components)
import { beautyApi } from '@/lib/beauty/api'

// Services chỉ dùng server-side (API routes)
import { venueService, serviceService, appointmentService } from '@/lib/beauty'
```

### Ví dụ

```typescript
"use client"

import { useEffect, useState } from 'react'
import { beautyApi } from '@/lib/beauty/api'
import type { BeautyVenue } from '@/lib/beauty/types'

export function SalonList() {
  const [venues, setVenues] = useState<BeautyVenue[]>([])

  useEffect(() => {
    beautyApi.getFeaturedVenues(10).then(setVenues).catch(() => setVenues([]))
  }, [])

  return (
    <div>
      {venues.map((v) => (
        <div key={v.id}>{v.name}</div>
      ))}
    </div>
  )
}
```

## Cấu hình

### Environment Variables

Dùng chung với Dining/Supabase (merge vào `.env.local` nếu chưa có):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup

1. Chạy migrations `DB/006_beauty_venues.sql`, `DB/007_beauty_services.sql`, `DB/008_beauty_appointments.sql` trên Supabase.
2. **(Tuỳ chọn)** Chạy seed `DB/009_seed_beauty.sql` trên Supabase để có dữ liệu mẫu cho trang Beauty (Top Rated cards và nội dung chi tiết tương ứng từng dịch vụ).
3. Kiểm tra RLS policies nếu dùng RLS.

## Tích hợp với các module khác

- **Độc lập**: Beauty hoạt động độc lập, dùng chung Supabase với Dining.
- **Merge chung**: Cấu hình env, client Supabase dùng chung; chỉ schema và services là riêng Beauty.
- **Mở rộng**: Có thể gắn với `bookings` hoặc user profile sau.

## Logic đặt lịch (Availability & Validation)

Module Beauty có **business logic** cho đặt lịch:

- **Availability**: Chỉ cho đặt vào slot còn trống (theo `operating_hours` và lịch đã có); tránh double-book.
- **Validation**: Khi tạo appointment kiểm tra venue/service, ngày không quá khứ, slot available.
- **Cancellation**: Chỉ cho hủy nếu còn ≥ 24h trước giờ bắt đầu và status hợp lệ.

Chi tiết và luồng dùng: xem **[BEAUTY_LOGIC.md](../BEAUTY_LOGIC.md)** ở thư mục gốc project.

- API slot trống: `GET /api/beauty/venues/[id]/availability?date=YYYY-MM-DD&service_id=xxx`
- Client: `beautyApi.getAvailableSlots(venueId, date, serviceId)`.
- Tạo appointment: backend tự validate và kiểm tra slot; trả 409 nếu slot không còn.
- Hủy: backend kiểm tra chính sách; trả 403 nếu không được hủy.

## Lưu ý

1. **Authentication**: API có thể nhận `user_id` từ session/header khi cần (ví dụ appointments).
2. **Error handling**: Services có xử lý lỗi cơ bản; có thể mở rộng theo nhu cầu.
3. **Pagination**: Các API list hỗ trợ `limit` và `offset`.
