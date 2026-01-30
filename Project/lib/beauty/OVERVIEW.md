# Beauty Module - Tổng quan

## Kiến trúc Module

Module Beauty được thiết kế theo nguyên tắc **Modular** và **Loose Coupling** (tương tự Dining):

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Components                  │
│  (components/beauty/*.tsx, app/beauty/**)              │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Client API Layer                            │
│  (lib/beauty/api.ts)                                    │
│  - beautyApi.getVenues() / getFeaturedVenues()          │
│  - beautyApi.getServiceById() / getServicesListing()    │
│  - beautyApi.createAppointment()                        │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes                          │
│  (app/api/beauty/**/*.ts)                               │
│  - /api/beauty/venues, /venues/[id], /venues/featured    │
│  - /api/beauty/services, /services/[id], /listing       │
│  - /api/beauty/appointments                             │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Service Layer                              │
│  (lib/beauty/services/*.ts)                             │
│  - venueService                                         │
│  - serviceService                                       │
│  - appointmentService                                  │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Database (Supabase)                         │
│  - beauty_venues                                        │
│  - beauty_services                                      │
│  - beauty_appointments                                  │
└─────────────────────────────────────────────────────────┘
```

## File trung tâm: `lib/beauty/index.ts`

File này là **hub** export types và services (client API nằm ở `api.ts`):

- Export types: `BeautyVenue`, `BeautyService`, `BeautyAppointment`, request/response types.
- Export services: `venueService`, `serviceService`, `appointmentService` (dùng trong API routes).

Client components import từ `@/lib/beauty/api` (beautyApi).

## Luồng dữ liệu

1. **Listing (BeautyList)**: Gọi `beautyApi.getServicesListing()` → API `/api/beauty/services/listing` → serviceService + join venue → trả về dịch vụ kèm tên salon, rating, review count.
2. **Near You (BeautyNearYou)**: Gọi `beautyApi.getFeaturedVenues(3)` → API `/api/beauty/venues/featured` → venueService → danh sách salon gần / nổi bật.
3. **Service detail (`/beauty/[id]`)**: Gọi `beautyApi.getServiceById(id)` rồi `beautyApi.getVenueById(venue_id)` → hiển thị dịch vụ + thông tin venue (giá, thời lượng, địa chỉ).
4. **Venue detail (`/beauty/venue/[id]`)**: Gọi `beautyApi.getVenueById(id)` và `beautyApi.getVenueServices(id)` → trang salon với danh sách dịch vụ.
5. **Booking**: Frontend gọi `beautyApi.createAppointment(...)` → POST `/api/beauty/appointments` → appointmentService.

## Merge với phần chung

- **Supabase**: Dùng chung `NEXT_PUBLIC_SUPABASE_*` và `SUPABASE_SERVICE_ROLE_KEY` với Dining.
- **lib/api**: Client HTTP chung (nếu có) dùng cho cả Dining và Beauty.
- **Cấu trúc**: Giống Dining (services, api routes, types) để dễ bảo trì và mở rộng.
