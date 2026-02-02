# Lịch Sử Yêu Cầu & Tác Vụ Dự Án TripC (Project Prompts History)

Tài liệu này tổng hợp chi tiết các yêu cầu (prompts), mục tiêu và các thay đổi đã thực hiện trong quá trình phát triển dự án TripC gần đây. 

---

## 🛠️ 1. Sửa Lỗi & Gỡ Lỗi (Bug Fixes & Debugging)

### 1.1. Fixing Voucher Logic (Sửa Logic Voucher)
- **Thời gian:** 02/02/2026
- **Vấn đề:** Voucher đã đổi vẫn hiển thị trong Marketplace và user có thể đổi một voucher nhiều lần.
- **Giải pháp:** 
    - Cập nhật API backend để filter bỏ các voucher đã exchange.
    - Implement server-side validation để chặn việc đổi trùng.
    - Cập nhật UI frontend để phản ánh trạng thái "Đã đổi".
- **File liên quan:** `VoucherSection.tsx`, `components/rewards/*`, API routes liên quan.

### 1.2. Fixing Activity Images (Sửa Hình Ảnh Hoạt Động)
- **Thời gian:** 02/02/2026
- **Vấn đề:** Hình ảnh activities bị lỗi hoặc không hiển thị trên Home page và Detail page.
- **Giải pháp:** 
    - Cập nhật cơ sở dữ liệu với URL hình ảnh hợp lệ.
    - Xử lý frontend để fallback hình ảnh nếu load lỗi.
- **File liên quan:** `ActivitiesHero.tsx`, Database (Activities table).

### 1.3. Fix Activity Booking Logic (Sửa Logic Đặt Vé Hoạt Động)
- **Thời gian:** 02/02/2026
- **Vấn đề:** Không thể đặt vé trẻ em nếu không chọn vé người lớn.
- **Giải pháp:** Điều chỉnh validation trong sidebar đặt vé để cho phép case chỉ đặt vé trẻ em (hoặc tùy chỉnh rule tương ứng).
- **File liên quan:** `ActivityBookingSidebar.tsx`.

### 1.4. Debugging Flight Booking (Sửa Lỗi Đặt Vé Máy Bay)
- **Thời gian:** 02/02/2026
- **Vấn đề:** Lỗi trong quy trình booking, API routes trả về lỗi, chuyển hướng thất bại.
- **Giải pháp:** 
    - Fix API route handling.
    - Sửa logic trong `FlightService` hoặc service tương đương.
    - Kiểm tra flow redirect sau khi book.
- **File liên quan:** `app/flight/checkout`, API routes.

### 1.5. Debugging Payment Amount (Sửa Lỗi Số Tiền Thanh Toán)
- **Thời gian:** 01/02/2026
- **Vấn đề:** Thanh toán qua Momo/PayPal bị từ chối do amount = 0 hoặc invalid.
- **Giải pháp:** Debug flow tính toán `totalAmount` từ Booking tới Payment Service. Đảm bảo số tiền được truyền đúng sang gateway thanh toán.
- **File liên quan:** `checkout/services/settlement.service.ts`, Payment Providers.

### 1.6. Fixing Flight Settlement & Guest Support (Sửa Lưu Trữ Vé & Hỗ Trợ Guest)
- **Thời gian:** 31/01/2026
- **Vấn đề:** Vé máy bay không được lưu (settle) đúng vào DB; lỗi khi guest book vé.
- **Giải pháp:** 
    - Population dữ liệu cho các trường non-null.
    - Hỗ trợ guest layout/check-out.
    - Cập nhật RLS policies cho guest.
- **File liên quan:** `SettlementService`, Database Schema.

### 1.7. Debugging Email Notifications (Sửa Lỗi Email)
- **Thời gian:** 31/01/2026
- **Vấn đề:** User đã đăng nhập không nhận được email xác nhận.
- **Giải pháp:** 
    - Debug `UnifiedEmailService`.
    - Kiểm tra cấu hình SMTP và Template rendering.
    - Thêm logging để trace lỗi gửi mail.
- **File liên quan:** `lib/services/unified-email.service.ts`.

### 1.8. Các Lỗi Khác
- **Fixing ActivitiesHero Compilation Error (30/01):** Sửa lỗi cú pháp JSX (`Unexpected token section`).
- **Fixing Transport Checkout Error (30/01):** Sửa lỗi `ReferenceError: booking is not defined` trong `transport/checkout/page.tsx`.
- **Fixing Booking Navigation (30/01):** Sửa lỗi "Booking not found" khi chuyển trang thanh toán Wellness/Activities.
- **Fixing Payment API (29/01):** Sửa lỗi `PGRST205` do gọi sai bảng `payments` thay vì `payment_transactions`.
- **Fixing Booking Schema (29/01):** Sửa lỗi `PGRST204` do sai tên cột `booking_type` -> `category`.

---

## 🚀 2. Tính Năng & Logic (Feature Implementation & Logic)

### 2.1. Fixing Wishlist Sync (Đồng Bộ Wishlist Realtime)
- **Thời gian:** 02/02/2026
- **Mục tiêu:** Cập nhật trạng thái Wishlist (tim) ngay lập tức không cần F5.
- **Giải pháp:** 
    - Implement Global State Management (Zustand hoặc Context) cho Wishlist.
    - Xử lý hydration mismatch giữa server và client.
- **File liên quan:** `useWishlist.ts`, `WishlistButton` components.

### 2.2. Instant UI Updates for Rewards (Cập Nhật T-cent Tức Thì)
- **Thời gian:** 02/02/2026
- **Mục tiêu:** Số dư T-cent và trạng thái Quest cập nhật ngay sau khi claim.
- **Giải pháp:** 
    - Sử dụng `useCurrentUser` hook để listen thay đổi.
    - Trigger refetch/đẩy event update sau khi claim thành công.
- **File liên quan:** `EarnList.tsx`, `useCurrentUser`.

---

## 🎨 3. UI/UX Improvements (Giao Diện & Trải Nghiệm)

### 3.1. Updating Quick Access Links (Cập Nhật Liên Kết Nhanh)
- **Thời gian:** 02/02/2026
- **Mục tiêu:** Sửa link trong phần "My Bookings" cho đúng đích.
- **Giải pháp:** 
    - Khách sạn -> `/hotels`
    - Chuyến bay -> `/flights`
    - AI Planner -> Trigger Chatbot
    - Khám phá -> `/`
- **File liên quan:** Dashboard/MyBookings page.

### 3.2. Fixing Hotel Currency Display (Hiển Thị Tiền Tệ Khách Sạn)
- **Thời gian:** 02/02/2026
- **Mục tiêu:** Thống nhất hiển thị giá USD cho toàn bộ module khách sạn.
- **Giải pháp:** Rà soát và hardcode/config hiển thị USD (thay vì VND) trong `HotelList`, `BookingSidebar`.
- **File liên quan:** `components/hotel/*`.

### 3.3. Refining Detail Page Spacing (Tinh Chỉnh Khoảng Trắng)
- **Thời gian:** 29/01/2026
- **Mục tiêu:** Giảm khoảng trắng thừa trên trang chi tiết Activity/Wellness.
- **Giải pháp:** Điều chỉnh CSS/Padding/Margin.

### 3.4. Fixing Flight Duration Display (Hiển Thị Thời Gian Bay)
- **Thời gian:** 30/01/2026
- **Mục tiêu:** Hiển thị đúng thời gian bay trên card kết quả.
- **File liên quan:** `FlightResultCard.tsx`.

---

## ℹ️ 4. Hỏi Đáp & Thông Tin (Inquiries)

### 4.1. Project Tech Stack Inquiry
- **Thời gian:** 02/02/2026
- **Nội dung:** User hỏi về Framework (Next.js App Router), Data Fetching (Server vs Client), Supabase URL config.

### 4.2. Transport Booking Schema Inquiry
- **Thời gian:** 29/01/2026
- **Nội dung:** User hỏi về cấu trúc bảng database cho booking vận chuyển.

---

*Tài liệu này được tự động tổng hợp từ lịch sử làm việc của AI Agent.*
