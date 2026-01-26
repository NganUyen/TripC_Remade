# **BUSINESS REQUIREMENTS DOCUMENT (BRD)**

PROJECT: TRIPC.AI – SUPER TRAVEL APP

MODULE: SHOP (E-COMMERCE & LIFESTYLE)

---

### **1\) Tóm tắt mục tiêu nghiệp vụ (Business Goals)**

* **Core Capability:** Xây dựng sàn thương mại điện tử tích hợp, cho phép người dùng mua sắm các sản phẩm du lịch (Vali, phụ kiện, Sim/Esim) và hàng hóa phong cách sống (Lifestyle) với trải nghiệm chuẩn Shopee/Lazada.  
* **Conversion Optimization:** Tối ưu hóa luồng mua sắm từ Khám phá \-\> Thanh toán thông qua các công cụ kích cầu như Flash Sale, Combo khuyến mãi và Gợi ý cá nhân hóa (AI Recommendation).  
* **Ecosystem Integration:** Tăng cường lòng trung thành thông qua việc tích điểm và tiêu điểm **Tcent**, đồng thời tận dụng traffic từ luồng đặt phòng để bán chéo (Cross-sell) hàng hóa vật lý.

### **2\) Business Requirements (User Stories & KPIs)**

**User Stories (Chính):**

* *Là người mua hàng,* tôi muốn tìm nhanh một chiếc vali size M màu đen và xem phí ship về Hà Nội trước khi đặt.  
* *Là người săn deal,* tôi muốn áp dụng cùng lúc Voucher của Shop và Voucher của TripC để có giá tốt nhất.  
* *Là người dùng thân thiết,* tôi muốn dùng điểm Tcent tích lũy được từ các chuyến đi trước để thanh toán cho đơn hàng này.  
* *Là quản lý vận hành (Admin),* tôi muốn theo dõi hành trình đơn hàng và quản lý đổi trả/hoàn tiền tự động theo chính sách.

**KPIs (Chỉ số hiệu năng):**

* **Page Load Time:** Thời gian tải trang Home/Product Detail \< 1.5s (kể cả khi có nhiều ảnh High-res).  
* **Cart Abandonment Rate:** Tỷ lệ bỏ giỏ hàng \< 60% (nhờ quy trình Checkout tối giản).  
* **Order Success Rate:** Tỷ lệ đơn hàng giao thành công \> 90% (giảm hoàn/hủy).  
* **CSAT (Customer Satisfaction):** Điểm đánh giá sản phẩm/dịch vụ trung bình \> 4.5 sao.

### **3\) Luồng nghiệp vụ (Shopping Flow End-to-End)**

1. **Discovery (Khám phá):** User lướt Home Shop (Banner, Category), tìm kiếm từ khóa (Search), hoặc xem bộ sưu tập gợi ý (Collections).  
2. **Product Detail (Xem chi tiết):**  
   * Chọn biến thể (SKU Selection): Màu sắc, Kích thước. Hệ thống check tồn kho realtime.  
   * Ước tính phí ship và thời gian giao hàng theo địa chỉ mặc định.  
3. **Cart & Checkout (Giỏ hàng & Đặt):**  
   * Gom nhóm sản phẩm theo nhà cung cấp (nếu Multi-vendor).  
   * Áp dụng Voucher (Stacking logic: Shop \+ Platform) và Tcent.  
4. **Payment (Thanh toán):** Xử lý thanh toán qua Cổng (Thẻ/Ví) hoặc chọn COD (Thanh toán khi nhận hàng).  
5. **Fulfillment (Vận hành):**  
   * Hệ thống đẩy đơn sang kho/đối tác vận chuyển (3PL Integration).  
   * Cập nhật trạng thái vận đơn (Tracking Number).  
6. **Post-Purchase (Sau bán):**  
   * User theo dõi hành trình đơn hàng.  
   * Xác nhận "Đã nhận hàng" $\\rightarrow$ Hệ thống cộng điểm Tcent.  
   * Gửi đánh giá/khiếu nại hoặc yêu cầu Trả hàng/Hoàn tiền (RMA).

### **4\) Product Requirements (Chi tiết tính năng)**

**MVP (Phải có \- Phase 1):**

* **Storefront:** Trang chủ với Banner slider, Danh mục đa cấp, Top bán chạy.  
* **PDP (Product Page):** Chọn SKU (Màu/Size), Thư viện ảnh, Mô tả, Review cơ bản.  
* **Checkout Engine:** Giỏ hàng, Quản lý địa chỉ (Address Book), Tính phí ship tự động (theo trọng lượng).  
* **Promo Engine:** Hỗ trợ Voucher giảm tiền/phần trăm, Tích hợp Tcent.  
* **OMS (Order Management):** Theo dõi trạng thái đơn (Pending $\\rightarrow$ Delivered), Hủy đơn (khi chưa ship).

**Advanced (Phase 2+):**

* **Flash Sale Module:** Đếm ngược thời gian, thanh tiến độ tồn kho (Stock bar), giới hạn lượt mua.  
* **Social Commerce:** Livestream bán hàng, Share to Earn (Tiếp thị liên kết).  
* **AI Recommendations:** Gợi ý "Thường mua cùng nhau" (Bundle) hoặc "Sản phẩm tương tự".  
* **Smart Logistics:** Tách đơn hàng thông minh (Split Order) nếu sản phẩm nằm ở nhiều kho khác nhau.

**Non-functional:**

* **Scalability:** Chịu tải cao trong các đợt Mega Sale (11/11, 12/12).  
* **Consistency:** Đồng bộ tồn kho chính xác để tránh bán quá (Overselling).

### **5\) Dữ liệu & Mô hình (Key Entities)**

* **Product:** productId, name, description, brandId, categoryId, attributes (JSON).  
* **SKU (Variant):** skuId, productId, attributes (Color: Red, Size: M), price, stock, weight.  
* **Cart:** cartId, userId, items\[\] (skuId, quantity).  
* **Order:** orderId, userId, shippingAddress, paymentMethod, items\[\], shippingFee, discountTotal, grandTotal, status.  
* **Voucher:** code, type (Shop/Platform), value, minSpend, usageLimit.  
* **Tracking:** orderId, carrier, trackingCode, timeline\[\].

### **6\) APIs & Integrations**

**Thiết kế API (RESTful):**

* GET /api/v1/products/search: Tìm kiếm & Lọc sản phẩm.  
* GET /api/v1/products/{id}: Lấy chi tiết sản phẩm & SKU.  
* POST /api/v1/cart/calculate: Tính toán tổng tiền (Giá \+ Ship \- Voucher).  
* POST /api/v1/orders/create: Tạo đơn hàng mới & Trừ tồn kho.  
* GET /api/v1/orders/{id}/track: Lấy trạng thái vận chuyển.

**Integrations (Cần có):**

* **Logistics (3PL):** GHN / GHTK / NinjaVan / Ahamove (API tính phí ship & Tạo vận đơn tự động).  
* **Payment Gateway:** VNPay / Momo / ZaloPay / Stripe.  
* **Communication:** Firebase (Push Noti), SendGrid (Email cập nhật đơn hàng).  
* **Search Engine:** Elasticsearch hoặc Algolia (để search nhanh và thông minh).

