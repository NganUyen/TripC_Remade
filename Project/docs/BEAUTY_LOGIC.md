# Logic module Beauty – Giải thích và triển khai

## “Logic” trong Beauty là gì?

**Logic** ở đây là **business logic** (quy tắc nghiệp vụ) và **validation** (kiểm tra dữ liệu) cho luồng đặt lịch Beauty (salon/spa):

1. **Availability (khả năng đặt lịch)**  
   Chỉ cho phép đặt vào **slot còn trống**, không trùng với lịch đã có (tránh double-book). Slot phải nằm trong **giờ mở cửa** của venue (`operating_hours`).

2. **Validation khi tạo appointment**  
   - Venue tồn tại và đang active.  
   - Nếu chọn service: service thuộc đúng venue, và dùng `duration_minutes` của service.  
   - Ngày đặt ≥ hôm nay (không đặt quá khứ).  
   - Giờ đặt đúng format (HH:mm).  
   - Slot (ngày + giờ + duration) phải **available** (đã kiểm tra ở trên).

3. **Chính sách hủy (cancellation policy)**  
   Chỉ cho hủy khi:  
   - Trạng thái là `pending` hoặc `confirmed` (không hủy khi đã completed/cancelled/no_show).  
   - Còn ít nhất **24 giờ** trước giờ bắt đầu (cấu hình bằng `CANCELLATION_HOURS_AHEAD` trong code).

---

## Đã triển khai ở đâu

| Mục | File / API | Mô tả ngắn |
|-----|------------|------------|
| **Tính slot trống** | `lib/beauty/services/availabilityService.ts` | `getAvailableSlots(venueId, date, { serviceId })` – slot 30 phút, theo `operating_hours`, trừ các appointment chưa cancelled/no_show. |
| **Kiểm tra 1 slot** | Cùng file | `isSlotAvailable(venueId, date, time, durationMinutes)` – dùng khi tạo appointment. |
| **Validation + duration** | `lib/beauty/bookingLogic.ts` | `validateCreateAppointment(body)` – kiểm tra venue, service, ngày/giờ, trả về `durationMinutes` dùng khi tạo. |
| **Chính sách hủy** | Cùng file | `canCancelAppointment(appointment)` – chỉ cho hủy nếu status hợp lệ và còn ≥ 24h trước giờ bắt đầu. |
| **API slot trống** | `GET /api/beauty/venues/[id]/availability?date=YYYY-MM-DD&service_id=xxx` | Trả về `{ success, data: { available_slots: ["09:00", "09:30", ...] } }`. |
| **Tạo appointment** | `POST /api/beauty/appointments` | Gọi `validateCreateAppointment` → `isSlotAvailable` → mới `createAppointment`. Trả về 400/409 nếu lỗi validation hoặc slot không còn. |
| **Hủy appointment** | `DELETE /api/beauty/appointments/[id]` | Lấy appointment, gọi `canCancelAppointment`; nếu false trả 403, nếu ok mới gọi `cancelAppointment`. |
| **Client** | `lib/beauty/api.ts` | `beautyApi.getAvailableSlots(venueId, date, serviceId)` – dùng cho form chọn giờ. |

---

## Luồng đặt lịch (frontend gợi ý)

1. User chọn venue (và có thể chọn service).  
2. Gọi `beautyApi.getAvailableSlots(venueId, date, serviceId)` để lấy danh sách giờ trống.  
3. User chọn một slot (ví dụ `"14:00"`), điền thông tin khách.  
4. Gọi `beautyApi.createAppointment({ venue_id, service_id?, appointment_date, appointment_time, guest_name, ... })`.  
   - Backend tự validate và kiểm tra slot; nếu slot vừa bị đặt (race) sẽ trả 409.  
5. Hủy: gọi `beautyApi.cancelAppointment(id)`; backend trả 403 nếu không được phép hủy (đã qua thời hạn hoặc trạng thái không cho hủy).  

---

## Cấu hình

- **Bước slot**: 30 phút (sửa trong `availabilityService.ts`: `SLOT_INTERVAL_MINUTES`).  
- **Giờ mặc định** (khi venue không có `operating_hours` cho ngày đó): 08:00–20:00.  
- **Hủy trước**: 24 giờ (sửa trong `bookingLogic.ts`: `CANCELLATION_HOURS_AHEAD`).  

---

## Tóm tắt

**Logic Beauty** = **availability** (slot trống theo giờ mở cửa + lịch hiện có) + **validation** khi tạo (venue, service, ngày/giờ, slot còn trống) + **cancellation policy** (24h trước, status hợp lệ). Đã triển khai trong `availabilityService`, `bookingLogic`, API routes và client `beautyApi.getAvailableSlots` / `createAppointment` / `cancelAppointment`.
