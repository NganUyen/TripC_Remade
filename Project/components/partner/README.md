# Restaurant Portal - Documentation

## 📁 Cấu trúc Thư mục

```
components/partner/
├── restaurant/                         # Restaurant Portal
│   ├── RestaurantPortalLayout.tsx      # Layout chính với sidebar navigation
│   ├── RestaurantDashboard.tsx          # Dashboard tổng quan
│   ├── RestaurantPortal.tsx            # Entry point component
│   ├── operations/                      # Vận hành Nhà hàng
│   ├── orders/                          # Đơn hàng & Doanh thu
│   ├── marketing/                       # Marketing & Gamification
│   ├── inventory/                      # Kho hàng & Nguyên liệu
│   ├── admin/                          # Quản trị & Phân tích
│   └── index.ts                        # Export file
├── hotel/                              # Hotel Portal
│   ├── HotelPortalLayout.tsx           # Layout chính với sidebar navigation
│   ├── HotelDashboard.tsx               # Dashboard tổng quan
│   ├── HotelPortal.tsx                 # Entry point component
│   ├── operations/                      # Vận hành Khách sạn (sẽ tạo)
│   ├── reservations/                    # Đặt phòng & Quản lý Giá (sẽ tạo)
│   ├── commerce/                       # Thương mại điện tử (sẽ tạo)
│   ├── marketing/                      # Marketing & Gamification (sẽ tạo)
│   ├── analytics/                      # Phân tích & Hiệu suất (sẽ tạo)
│   ├── feedback/                      # Phản hồi & Đánh giá (sẽ tạo)
│   └── admin/                          # Quản trị Hệ thống (sẽ tạo)
└── README.md                           # File này
```

## 🚀 Cách Sử dụng

### Entry Points

#### Restaurant Portal
- **File**: `app/partner/restaurant/page.tsx`
- **Component**: `components/partner/restaurant/RestaurantPortal.tsx`
- **URL**: `http://localhost:3000/partner/restaurant`

#### Hotel Portal
- **File**: `app/partner/hotel/page.tsx`
- **Component**: `components/partner/hotel/HotelPortal.tsx`
- **URL**: `http://localhost:3000/partner/hotel`

#### Selection Page
- **File**: `app/partner/page.tsx`
- **URL**: `http://localhost:3000/partner`
- **Chức năng**: Cho phép chọn giữa Restaurant và Hotel Portal

## 📝 Các Thay đổi Cần thiết

### ✅ ĐÃ HOÀN THÀNH

#### 1. Tạo Route Page
- **File**: `app/partner/restaurant/page.tsx` ✅
- **Mục đích**: Entry point để hiển thị Restaurant Portal trên web
- **URL**: `http://localhost:3000/partner/restaurant`
- **Không conflict**: Route mới, không ảnh hưởng routes hiện tại

#### 2. Tạo Component Entry Point
- **File**: `components/partner/restaurant/RestaurantPortal.tsx` ✅
- **Mục đích**: Component chính điều phối các section
- **Không conflict**: Component mới, không thay đổi components hiện tại

#### 3. Cập nhật RestaurantPortalLayout
- **File**: `components/partner/restaurant/RestaurantPortalLayout.tsx` ✅
- **Thay đổi**: Thêm prop `onSectionChange` để xử lý navigation
- **Không conflict**: Chỉ thêm prop mới, không thay đổi logic cũ

#### 4. Tạo Layout riêng cho Partner
- **File**: `app/partner/layout.tsx` ✅
- **Mục đích**: Ẩn Header và CategorySlider khi vào Partner Portal
- **Không conflict**: Layout riêng, không ảnh hưởng layout gốc

#### 5. Thêm Menu "Partner" vào Header
- **File**: `components/Header.tsx` ✅
- **Thay đổi**: Thêm link "Partner" vào navigation bar, nằm sau "Support"
- **Link**: `/partner` (trang chọn giữa Restaurant và Hotel)
- **Lưu ý**: Đây là thay đổi duy nhất trong file hiện có, rất nhỏ và an toàn

#### 6. Tạo Selection Page
- **File**: `app/partner/page.tsx` ✅
- **Mục đích**: Trang chọn giữa Restaurant Portal và Hotel Portal
- **Không conflict**: Route mới

#### 7. Tạo Hotel Portal (Đang phát triển)
- **Files**: 
  - `app/partner/hotel/page.tsx` ✅
  - `components/partner/hotel/HotelPortalLayout.tsx` ✅
  - `components/partner/hotel/HotelDashboard.tsx` ✅
  - `components/partner/hotel/HotelPortal.tsx` ✅
- **Trạng thái**: Đã tạo layout và dashboard, các components khác đang được phát triển

### 📋 Cấu trúc Routing
Restaurant Portal sử dụng client-side routing với state management để chuyển đổi giữa các section, không cần tạo nhiều routes.

### 🚀 Cách Chạy

1. **Start development server**:
   ```bash
   npm run dev
   # hoặc
   yarn dev
   ```

2. **Truy cập Partner Portal**:
   - **Cách 1**: Click vào menu "Partner" trong Header (bên phải mục "Support")
   - **Cách 2**: Truy cập trực tiếp: `http://localhost:3000/partner`
   - Sau đó chọn **Restaurant Portal** hoặc **Hotel Portal**

3. **Navigation**:
   - Click vào các menu item trong sidebar để chuyển đổi giữa các section
   - Tất cả navigation được xử lý client-side, không cần reload page

## 🎯 Tính năng Chính

### 1. Restaurant Operations
- ✅ Quản lý Cơ sở (My Outlets)
- ✅ Quản lý Thực đơn (Menu Management)
- ✅ Sơ đồ Bàn (Table Management)
- ✅ Hệ thống KDS (Kitchen Display System)

### 2. Order & Revenue
- ✅ Đặt bàn (Reservations)
- ✅ Quản lý Đơn hàng (Order Management)
- ✅ Kiểm soát Giá (Pricing Management)
- ✅ Báo cáo Tài chính (Financial Reports)

### 3. Marketing & Gamification
- ✅ Chương trình Hội viên (Loyalty Program)
- ✅ Gamification (Foodie Quest, Lucky Wheel, Review Rewards)
- ✅ Khuyến mãi (Promotions)

### 4. Inventory Management
- ✅ Quản lý Nguyên liệu (Stock Control)
- ✅ Công thức món ăn (Recipe/BOM)
- ✅ Cảnh báo Tồn kho (Stock Alerts)

### 5. Admin & Analytics
- ✅ Phân tích (Menu Engineering, Heatmap)
- ✅ Quản lý Đội ngũ (Staff Management)
- ✅ Kết nối Thiết bị (Hardware Integration)

## 🔧 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Architecture**: Loose Coupling, Component-based

## 📌 Lưu ý

1. **Không Conflict**: Tất cả code mới được đặt trong `components/partner/restaurant/`, không thay đổi code hiện tại
2. **Route Mới**: Route `/partner/restaurant` là route mới, không ảnh hưởng routes hiện tại
3. **State Management**: Sử dụng React useState để quản lý state, có thể nâng cấp lên Context API hoặc Zustand nếu cần
4. **Data**: Hiện tại sử dụng mock data, cần tích hợp với API thực tế

## 🔄 Các Bước Triển khai

1. ✅ Tạo tất cả components
2. ✅ Tạo entry point component (`RestaurantPortal.tsx`)
3. ✅ Tạo route page (`app/partner/restaurant/page.tsx`)
4. ✅ Tạo layout riêng (`app/partner/layout.tsx`)
5. ✅ Cập nhật navigation trong `RestaurantPortalLayout`
6. ⏳ Tích hợp với API (nếu có)
7. ⏳ Thêm authentication (nếu cần)
8. ⏳ Testing và optimization

## 📂 Danh sách Files Đã Tạo

### Entry Points
- ✅ `app/partner/restaurant/page.tsx` - Route page chính
- ✅ `app/partner/layout.tsx` - Layout riêng (ẩn Header/CategorySlider)
- ✅ `components/partner/restaurant/RestaurantPortal.tsx` - Component entry point

### Layout & Dashboard
- ✅ `components/partner/restaurant/RestaurantPortalLayout.tsx` - Layout với sidebar
- ✅ `components/partner/restaurant/RestaurantDashboard.tsx` - Dashboard tổng quan

### Operations (4 files)
- ✅ `components/partner/restaurant/operations/MyOutlets.tsx`
- ✅ `components/partner/restaurant/operations/MenuManagement.tsx`
- ✅ `components/partner/restaurant/operations/TableManagement.tsx`
- ✅ `components/partner/restaurant/operations/KitchenDisplaySystem.tsx`

### Orders & Revenue (4 files)
- ✅ `components/partner/restaurant/orders/Reservations.tsx`
- ✅ `components/partner/restaurant/orders/OrderManagement.tsx`
- ✅ `components/partner/restaurant/orders/PricingManagement.tsx`
- ✅ `components/partner/restaurant/orders/FinancialReports.tsx`

### Marketing & Gamification (3 files)
- ✅ `components/partner/restaurant/marketing/LoyaltyProgram.tsx`
- ✅ `components/partner/restaurant/marketing/Gamification.tsx`
- ✅ `components/partner/restaurant/marketing/Promotions.tsx`

### Inventory Management (3 files)
- ✅ `components/partner/restaurant/inventory/StockControl.tsx`
- ✅ `components/partner/restaurant/inventory/RecipeManagement.tsx`
- ✅ `components/partner/restaurant/inventory/StockAlerts.tsx`

### Admin & Analytics (3 files)
- ✅ `components/partner/restaurant/admin/Analytics.tsx`
- ✅ `components/partner/restaurant/admin/StaffManagement.tsx`
- ✅ `components/partner/restaurant/admin/HardwareIntegration.tsx`

### Utilities
- ✅ `components/partner/restaurant/index.ts` - Export file
- ✅ `components/partner/README.md` - File này

**Tổng cộng: 26+ files mới được tạo** (bao gồm cả Hotel Portal đang phát triển)

## ⚠️ Lưu ý Quan trọng

### Không Conflict với Code Hiện Tại
- ✅ Tất cả files mới được đặt trong `components/partner/` và `app/partner/`
- ✅ Chỉ thay đổi 1 dòng trong `components/Header.tsx` (thêm menu item)
- ✅ Routes `/partner`, `/partner/restaurant`, `/partner/hotel` là routes mới, không ảnh hưởng routes khác
- ✅ Layout riêng cho partner không ảnh hưởng layout gốc

### Khi Push lên GitHub
- ✅ Không có conflict vì không sửa file cũ
- ✅ Chỉ thêm files mới
- ✅ Có thể merge dễ dàng

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. Đã chạy `npm install` chưa?
2. Development server đã start chưa? (`npm run dev`)
3. Route có đúng không? (`/partner/restaurant`)
4. Console có lỗi không?
5. Đã import đúng components chưa?

## 🎯 Next Steps

1. **Tích hợp API**: Thay thế mock data bằng API calls thực tế
2. **Authentication**: Thêm authentication middleware nếu cần
3. **State Management**: Có thể nâng cấp lên Context API hoặc Zustand
4. **Testing**: Viết unit tests và integration tests
5. **Optimization**: Code splitting, lazy loading cho các components lớn
