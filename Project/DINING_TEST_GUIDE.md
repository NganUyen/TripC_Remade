# Hướng dẫn Test Hệ thống Dining Module

## Mục lục
1. [Chuẩn bị](#chuẩn-bị)
2. [Test Database](#test-database)
3. [Test API Endpoints](#test-api-endpoints)
4. [Test Frontend](#test-frontend)
5. [Test Cases](#test-cases)

## Chuẩn bị

### 1. Cài đặt Dependencies

```bash
cd TripC_Remade/Project
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `Project/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Chạy Database Migrations

Trên Supabase Dashboard:
1. Vào SQL Editor
2. Chạy lần lượt các file:
   - `DB/001.sql` - Tạo bảng `dining_venues`
   - `DB/002.sql` - Tạo bảng `dining_menus` và `dining_menu_items`
   - `DB/003.sql` - Tạo bảng `dining_tables`
   - `DB/004.sql` - Tạo bảng `dining_reservations`
   - `DB/005.sql` - Tạo bảng `dining_time_slots` và `dining_blocked_dates`

### 4. Chạy Development Server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

## Test Database

### 1. Insert Test Data

Chạy SQL sau trên Supabase để tạo dữ liệu test:

```sql
-- Insert test venue
INSERT INTO public.dining_venues (
  name, slug, description, address, city, district,
  cuisine_type, price_range, capacity, average_rating, review_count,
  cover_image_url, is_active, is_featured
) VALUES (
  'Madame Vo''s Kitchen',
  'madame-vos-kitchen',
  'Experience the authentic flavors of Vietnam reimagined with modern culinary techniques.',
  '123 Riverfront Avenue',
  'Da Nang',
  'Hai Chau',
  ARRAY['Vietnamese', 'Asian Fusion'],
  'upscale',
  50,
  4.9,
  2300,
  'https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=2670&auto=format&fit=crop',
  true,
  true
) RETURNING id;

-- Lưu venue_id từ kết quả trên, sau đó insert menu
-- Thay 'VENUE_ID_HERE' bằng ID thực tế
INSERT INTO public.dining_menus (venue_id, name, description, display_order, is_active)
VALUES (
  'VENUE_ID_HERE',
  'Main Menu',
  'Our signature dishes',
  1,
  true
) RETURNING id;

-- Insert menu items (thay MENU_ID_HERE và VENUE_ID_HERE)
INSERT INTO public.dining_menu_items (
  menu_id, venue_id, name, description, price, currency,
  category, is_available, is_featured, display_order
) VALUES
  ('MENU_ID_HERE', 'VENUE_ID_HERE', 'Pho Wagyu', 'Premium Wagyu beef pho', 250000, 'VND', 'Main Course', true, true, 1),
  ('MENU_ID_HERE', 'VENUE_ID_HERE', 'Spring Rolls', 'Fresh Vietnamese spring rolls', 120000, 'VND', 'Appetizer', true, false, 2),
  ('MENU_ID_HERE', 'VENUE_ID_HERE', 'Banh Mi', 'Traditional Vietnamese sandwich', 80000, 'VND', 'Main Course', true, false, 3);
```

## Test API Endpoints

### Sử dụng cURL hoặc Postman

### 1. Test GET Venues

```bash
# Lấy tất cả venues
curl http://localhost:3000/api/dining/venues

# Lọc theo city
curl "http://localhost:3000/api/dining/venues?city=Da%20Nang"

# Tìm kiếm
curl "http://localhost:3000/api/dining/venues?search=Vietnamese"

# Featured venues
curl http://localhost:3000/api/dining/venues/featured
```

### 2. Test GET Venue by ID

```bash
# Thay VENUE_ID bằng ID thực tế
curl http://localhost:3000/api/dining/venues/VENUE_ID
```

### 3. Test POST Create Venue

```bash
curl -X POST http://localhost:3000/api/dining/venues \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{
    "name": "Test Restaurant",
    "description": "A test restaurant",
    "city": "Ho Chi Minh City",
    "cuisine_type": ["Vietnamese"],
    "price_range": "moderate"
  }'
```

### 4. Test GET Menus

```bash
# Thay VENUE_ID bằng ID thực tế
curl "http://localhost:3000/api/dining/menus?venue_id=VENUE_ID"
```

### 5. Test GET Menu Items

```bash
# Lấy tất cả items của venue
curl "http://localhost:3000/api/dining/menus/items?venue_id=VENUE_ID"

# Lấy featured items
curl "http://localhost:3000/api/dining/menus/items?venue_id=VENUE_ID&featured=true"
```

### 6. Test POST Create Reservation

```bash
curl -X POST http://localhost:3000/api/dining/reservations \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{
    "venue_id": "VENUE_ID",
    "reservation_date": "2026-02-01",
    "reservation_time": "19:30",
    "guest_count": 2,
    "guest_name": "Test User",
    "guest_phone": "0123456789",
    "guest_email": "test@example.com"
  }'
```

### 7. Test Check Availability

```bash
curl "http://localhost:3000/api/dining/reservations/check?venue_id=VENUE_ID&date=2026-02-01&time=19:30&guest_count=2"
```

### 8. Test GET Reservations

```bash
# Lấy reservations của user
curl "http://localhost:3000/api/dining/reservations?user_id=test-user-123"

# Lấy reservations của venue trong một ngày
curl "http://localhost:3000/api/dining/reservations?venue_id=VENUE_ID&date=2026-02-01"
```

## Test Frontend

### 1. Test Trang Danh sách Nhà hàng

1. Mở trình duyệt: `http://localhost:3000/dining`
2. Kiểm tra:
   - Hero section hiển thị đúng
   - Featured venues hiển thị trong Bento section
   - Danh sách restaurants load từ API
   - Click vào restaurant chuyển đến detail page

### 2. Test Trang Chi tiết Nhà hàng

1. Click vào một restaurant từ danh sách
2. URL sẽ là: `http://localhost:3000/dining/[id]`
3. Kiểm tra:
   - Hero image và thông tin nhà hàng hiển thị đúng
   - Reservation sidebar hiển thị
   - Có thể chọn date, time, số guests
   - Click "Confirm Booking" tạo reservation

### 3. Test Reservation Flow

1. Vào trang detail của một restaurant
2. Chọn:
   - Date: Chọn một ngày trong tương lai
   - Time: Chọn giờ (ví dụ: 19:30)
   - Guests: Chọn số lượng khách
3. Click "Confirm Booking"
4. Kiểm tra:
   - Reservation được tạo thành công
   - Hiển thị reservation code
   - Redirect đến trang confirmation (nếu có)

## Test Cases

### Test Case 1: Tìm kiếm Venues

**Input:**
- Search query: "Vietnamese"
- City: "Da Nang"

**Expected:**
- Trả về các venues có "Vietnamese" trong tên hoặc description
- Chỉ lấy venues ở Da Nang
- Kết quả được paginate đúng

### Test Case 2: Tạo Reservation

**Input:**
- venue_id: Valid venue ID
- date: Ngày trong tương lai
- time: 19:30
- guest_count: 2
- guest_name: "Test User"

**Expected:**
- Reservation được tạo thành công
- Reservation code được generate tự động (format: DIN-XXXXXX)
- Status = "pending"
- Có thể query lại reservation bằng ID hoặc code

### Test Case 3: Check Availability

**Input:**
- venue_id: Valid venue ID
- date: Ngày có blocked date
- time: 19:30
- guest_count: 2

**Expected:**
- Trả về `available: false` với reason "Venue is closed on this date"

### Test Case 4: Update Reservation Status

**Input:**
- reservation_id: Valid reservation ID
- status: "confirmed"

**Expected:**
- Status được update thành "confirmed"
- `confirmed_at` timestamp được set
- Có thể query lại và thấy status mới

### Test Case 5: Get Featured Venues

**Input:**
- Endpoint: `/api/dining/venues/featured`
- limit: 10

**Expected:**
- Chỉ trả về venues có `is_featured = true`
- Sắp xếp theo rating (cao nhất trước)
- Tối đa 10 kết quả

## Troubleshooting

### Lỗi: "Supabase environment variables are not set"

**Giải pháp:**
- Kiểm tra file `.env.local` đã được tạo
- Đảm bảo các biến `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` đã được set
- Restart dev server sau khi thêm env variables

### Lỗi: "Table does not exist"

**Giải pháp:**
- Chạy lại các migration files (001.sql - 005.sql)
- Kiểm tra trên Supabase Dashboard xem các bảng đã được tạo chưa

### Lỗi: "Failed to fetch venues"

**Giải pháp:**
- Kiểm tra kết nối đến Supabase
- Kiểm tra RLS policies (nếu có)
- Kiểm tra console logs để xem error chi tiết

### Frontend không load data

**Giải pháp:**
- Mở Browser DevTools > Network tab
- Kiểm tra API calls có được gửi không
- Kiểm tra response từ API
- Kiểm tra console logs cho errors

## Next Steps

Sau khi test xong:

1. **Authentication Integration**: Thay thế `x-user-id` header bằng authentication thực tế (Clerk, Auth0, etc.)
2. **Error Handling**: Thêm error boundaries và better error messages
3. **Loading States**: Cải thiện loading states và skeletons
4. **Validation**: Thêm form validation cho reservation form
5. **Notifications**: Thêm toast notifications cho success/error
6. **RLS Policies**: Tạo Row Level Security policies trên Supabase nếu cần

## Liên hệ

Nếu gặp vấn đề, kiểm tra:
- Console logs trong browser
- Server logs trong terminal
- Supabase logs trong dashboard
- Network requests trong DevTools
