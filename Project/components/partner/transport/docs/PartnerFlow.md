# Transport Partner Flow & Database Schema

Tài liệu này chi tiết về luồng dữ liệu và cấu trúc cơ sở dữ liệu dành riêng cho dịch vụ Vận tải (Transport) trên hệ thống TripC.

## 1. Cơ sở Dữ liệu (Database Schema)

Dưới đây là các bảng chính trong hệ thống Supabase liên quan đến Transport Partner.

```mermaid
erDiagram
    TRANSPORT_PROVIDERS ||--o{ TRANSPORT_VEHICLES : "owns"
    TRANSPORT_PROVIDERS ||--o{ TRANSPORT_ROUTES : "manages"
    TRANSPORT_VEHICLES ||--o{ TRANSPORT_ROUTES : "assigned_to"
    TRANSPORT_ROUTES ||--o{ BOOKINGS : "has"

    TRANSPORT_PROVIDERS {
        uuid id PK
        text name
        text logo_url
        uuid owner_id FK "References auth.users"
        timestamp created_at
    }

    TRANSPORT_VEHICLES {
        uuid id PK
        text plate_number
        text model
        int capacity
        jsonb amenities "wifi, ac, tv, usb, etc."
        text status "active, maintenance, inactive"
        uuid provider_id FK
    }

    TRANSPORT_ROUTES {
        uuid id PK
        text origin
        text destination
        timestamp departure_time
        timestamp arrival_time
        numeric price
        text currency
        int seats_available
        text type "bus, limousine, etc."
        uuid provider_id FK
        uuid vehicle_id FK
    }

    BOOKINGS {
        uuid id PK
        text booking_code
        text status "confirmed, cancelled, etc."
        numeric total_amount
        jsonb passenger_info "name, phone, email"
        uuid route_id FK
    }
```

---

## 2. Luồng Gọi Dữ liệu (Data Flow)

Luồng logic từ khi User (Đối tác) đăng nhập đến khi hiển thị dữ liệu trên các module (Fleet, Routes, Bookings).

```mermaid
sequenceDiagram
    participant User as Transport Partner
    participant UI as React Component
    participant Auth as Supabase Auth
    participant DB as Supabase Database

    User->>UI: Truy cập Dashboard/Fleet
    UI->>Auth: getUser()
    Auth-->>UI: User Session (metadata, ID)
    
    rect rgb(240, 240, 240)
    Note over UI, DB: Bước 1: Xác định Quyền sở hữu (Providers)
    UI->>DB: query transport_providers where owner_id = User.id
    DB-->>UI: List of Providers (ProviderIDs)
    end

    rect rgb(230, 255, 230)
    Note over UI, DB: Bước 2: Lấy dữ liệu nghiệp vụ
    UI->>DB: query vehicles/routes where provider_id IN (ProviderIDs)
    DB-->>UI: Business Data (Vehicles, Routes, Bookings)
    end

    UI-->>User: Hiển thị bảng/sơ đồ/thông tin
```

---

## 3. Các API/Query Chính

### 3.1. Lấy danh sách xe (Fleet Management)
```typescript
const { data } = await supabase
    .from('transport_vehicles')
    .select('*')
    .in('provider_id', providerIds)
```

### 3.2. Lấy danh sách đặt chỗ (Booking Management)
```typescript
const { data } = await supabase
    .from('bookings')
    .select(`
        *,
        transport_routes (*)
    `)
    .order('created_at', { ascending: false })
```

---

## 4. Ghi chú Bảo mật (RLS)
- **Row Level Security (RLS)** được kích hoạt trên tất cả các bảng.
- Đối tác chỉ có thể xem/sửa dữ liệu mà họ sở hữu (`owner_id` hoặc thông qua `provider_id` liên kết).
