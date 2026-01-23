##    **1\. Scope**

## **The system manages the acquisition, validation, and redemption of digital value within TripC.ai. It covers:**

* ## **Tcent Issuance: Rewarding users for engagement (Quests, Events, Bookings).**

* ## **Voucher Management: The lifecycle from creation to "burning" during checkout.**

* ## **Tier Logic: Handling user status (e.g., Bronze) and its impact on reward rates.**

* ## **Financial Integrity: Ensuring "100 Tcents \= $1 USD" is consistently applied as a liability.**

## ---

### **2\. Business Process Flow**

1. ## **Earning Phase: User performs a "Quest" (e.g., submits a video link). The system records a PENDING Tcent transaction.**

2. ## **Approval Phase: Admin/AI verifies the submission. Tcents move from PENDING to AVAILABLE.**

3. ## **Exchange Phase: User "purchases" a Voucher using Tcents or receives one via an Event.**

4. ## **Checkout Phase: User applies the Voucher. The system validates rules (expiry, merchant match, min spend).**

5. ## **Settlement Phase: On successful payment, the Voucher is marked as REDEEMED, and Tcent/Voucher value is deducted from the platform's liability.**

## ---

### **3\. Functional Requirements (Modules)**

#### **M1: Quest & Engagement Engine**

* ## **FR-1.1 Submission: Capture user evidence (URLs/Images) for quests.**

* ## **FR-1.2 Daily Caps: Limit Tcent earnings per user per day to prevent system gaming.**

#### **M2: Tcent Ledger**

* ## **FR-2.1 Balance Tracking: Maintain real-time Available and Pending balances.**

* ## **FR-2.2 Expiry Logic: Automatically expire Tcents if they are not used within a set timeframe (if applicable).**

#### **M3: Voucher Service**

* ## **FR-3.1 Scoped Discounts: Support for specific merchants (e.g., 20% off at Herbal Spa) or global platform discounts.**

* ## **FR-3.2 Stacking Rules: Define if multiple vouchers or Tcent-discounts can be combined in one cart.**

## ---

### **4\. Database Schema (Conceptual)**

| Table | Key Fields | Purpose |
| :---- | :---- | :---- |
| **Users** | **id, current\_tier (Bronze, etc.), tcent\_balance** | **Core user profile and status.** |
| **Tcent\_Ledger** | **id, user\_id, amount, status (Pending/Final), source** | **Auditable log of all currency movement.** |
| **Vouchers** | **id, code, value, min\_spend, merchant\_id, is\_purchasable** | **Definition of reward units.** |
| **Quests** | **id, reward\_amount, verification\_type (Auto/Manual)** | **Definition of engagement tasks.** |

## ---

### **5\. API Definitions**

* ## **GET /v1/rewards/balance: Returns current available\_tcent and pending\_tcent.**

* ## **POST /v1/quests/submit: Sends quest evidence (e.g., TikTok link) to the approval queue.**

* ## **POST /v1/vouchers/validate: Validates a voucher against a specific cart before payment.**

* ## **POST /v1/vouchers/redeem: Permanently consumes a voucher/Tcents upon order success.**

## ---

### **6\. Business Rules & Validations**

* ## **Rule 1 (Conversion): The system must strictly enforce 100 Tcents \= $1.00 USD at checkout.**

* ## **Rule 2 (Atomicity): Tcent deduction and Voucher issuance must occur in a single database transaction to prevent "double spending".**

* ## **Rule 3 (Tier Multiplier): If a user is above Bronze, apply a multiplier (e.g., 1.2x) to all Tcent-earning activities.**

## 

### **7\. Categories of Abuse (The "Hidden Cases")**

| Abuse Type | Mechanism | Business Impact |
| :---- | :---- | :---- |
| **Referral Farming** | Creating 50+ fake accounts to harvest "invite-a-friend" Tcents. | Drains marketing budget without real user growth. |
| **The "Double Dip"** | Attempting to redeem the same voucher simultaneously via mobile and web. | Financial loss due to multiple discounts on one transaction. |
| **Refund Gaming** | Booking an expensive hotel, earning 5,000 Tcents, spending them on a spa voucher, then canceling the hotel for a full refund. | Permanent loss of the "earned" value despite no revenue. |
| **Credential Stuffing** | Using automated bots to log into "Bronze" accounts to drain unused Tcents/vouchers. | Erases customer trust and brand reputation. |
| **Insider Laundering** | Staff at partner merchants creating fake accounts to "collect" rewards from customers who don't use the app. | Diverts incentives away from actual travelers. |

##                        **1\. Phạm Vi Trực Quan (UI/UX – Updated Visual Scope)**

Tcent Wallet:  
Ví hiển thị số dư Tcent theo thời gian thực, bao gồm:  
Available: Tcents có thể sử dụng  
Pending: Tcents đã kiếm được nhưng đang chờ duyệt  
Tier Status Badge  
Huy hiệu hiển thị cấp độ người dùng (Bronze hoặc cao hơn), đồng thời:  
Thay đổi theme dashboard  
Thể hiện Point Multiplier hiện tại  
Exchange Shop  
Khu vực giao diện cho phép người dùng duyệt voucher và xem hai mức giá:  
Giá bằng VND (tiền thật)  
Giá bằng Tcent  
Quest Progress Bar  
Thanh tiến trình hiển thị trạng thái Quest đang hoạt động  
(ví dụ: “Video đã gửi – đang chờ duyệt”)  
---

**2\. Luồng Quy Trình Nghiệp Vụ (The “Loyalty Loop”)**

1. Issuance (Phát hành)  
2. Marketing định nghĩa voucher và gán giá Tcent  
3. (ví dụ: Voucher trị giá $20 có giá 1.500 Tcents)  
4. Earning (Quest/Event)  
5. Người dùng gửi minh chứng Quest.  
6. Hệ thống tạo một bản ghi PENDING trong Tcent Ledger.  
7. Tier Check (Kiểm tra Tier)  
8. Khi Tcents được duyệt, hệ thống kiểm tra Membership Tier của người dùng để áp dụng hệ số thưởng phù hợp.  
9. Exchange (Đổi thưởng)  
10. Người dùng “chi tiêu” Tcents để nhận voucher.  
11. Hệ thống:  
12. Tạo bản ghi trong user\_vouchers  
13. Tạo giao dịch DEBIT trong tcent\_ledger  
14. Checkout (Thanh toán)  
15. Người dùng áp dụng voucher.  
16. Hệ thống kiểm tra trạng thái voucher và merchant\_id.  
17. Settlement (Quyết toán)  
18. Khi thanh toán thành công, voucher được đánh dấu consumed (đã sử dụng).

---

## **3\. Functional Requirements**

| ID | Requirement | Description |
| :---- | :---- | :---- |
| **FR-01** | **Multi-Type Support** | Support for Percentage (%), Fixed Amount (VND), and BOGO (Buy One Get One). |
| **FR-02** | **Merchant Scoping** | Vouchers must be restrictable to specific Merchants or Categories (e.g., only "Karaoke"). |
| **FR-03** | **Budget Caps** | Ability to set a "Max Redemption Count" (e.g., first 50 users) and "Max Discount Value." |
| **FR-04** | **Usage Limits** | Enforce "One per customer" or "One per order" rules. |
| **FR-05** | **AI Metadata** | Support for tags (e.g., is\_rainy\_day: true) so the AI can filter which vouchers to show. |

| ID | Module | Requirement Description |
| :---- | :---- | :---- |
| **FR-06** | **Tcent Exchange** | Users must be able to "purchase" vouchers using Tcents (100 Tcents \= $1). |
| **FR-07** | **Tier Multipliers** | System must apply a bonus to Tcent earnings based on tier (e.g., Bronze \= 1.0x, Silver \= 1.2x). |
| **FR-08** | **Quest Lifecycle** | Support for SUBMITTED $\\rightarrow$ PENDING $\\rightarrow$ APPROVED/REJECTED states for quest rewards. |
| **FR-09** | **Daily Earn Caps** | Limit total Tcents earned per day per user to prevent bot/farming abuse. |
| **FR-10** | **Refund Handling** | If a service is refunded, any Tcents earned from that transaction must be deducted (clawback logic). |

## **4\. Database Schema (Relational Model)**

To ensure **Economic Traceability**, we need a normalized structure.

### **Table: vouchers (The Definition)**

* id (UUID, PK)  
* code (String, Unique) \- e.g., "DANANG20"  
* discount\_type (Enum) \- percentage, fixed\_amount  
* discount\_value (Decimal)  
* min\_spend (Decimal)  
* max\_discount (Decimal) \- Crucial for % off vouchers.  
* total\_limit (Integer) \- Max times this voucher can be used.  
* used\_count (Integer) \- Current usage.  
* merchant\_id (UUID, Nullable) \- If Null, it's a platform-wide voucher.  
* starts\_at / expires\_at (Timestamp)

### **Table: user\_vouchers (The Collection/Link)**

* id (UUID, PK)  
* user\_id (UUID, FK)  
* voucher\_id (UUID, FK)  
* status (Enum) \- collected, consumed, expired  
* order\_id (UUID, Nullable) \- Links to the final purchase.

#### **Table: `tcent_ledger` (The Bank)**

* `id` (UUID, PK)  
* `user_id` (UUID, FK)  
* `amount` (Integer) — Positive for EARN, Negative for SPEND.  
* `transaction_type` (Enum) — `QUEST_REWARD`, `BOOKING_REWARD`, `VOUCHER_PURCHASE`.  
* `status` (Enum) — `PENDING`, `AVAILABLE`, `CANCELLED`.  
* `reference_id` (UUID) — Links to the QuestID or OrderID.

#### **Table: `membership_tiers`**

* `tier_id` (Enum) — `BRONZE`, `SILVER`, `GOLD`.  
* `earn_multiplier` (Decimal) — e.g., `1.15` for Silver.  
* `min_spend_threshold` (Decimal) — Total lifetime spend required to reach this tier.

---

**5\. Quy Tắc Nghiệp Vụ & Kiểm Tra (The “Logic Gates”)**

* A. Kiểm Tra Đổi Tcent → Voucher  
* Rule (Đủ số dư)  
* SUM(available\_tcents) ≥ voucher.tcent\_price  
* Rule (Giao dịch nguyên tử)  
* Việc trừ Tcent và ghi nhận voucher vào ví người dùng phải diễn ra trong cùng một DB transaction.  
* Nếu một bước thất bại, toàn bộ giao dịch phải rollback.  
* B. Quy Tắc Chống Gian Lận (Hidden Cases)  
* Rule (Chống Double-Dip)  
* Sử dụng Distributed Lock (Redis) trên VoucherID trong cửa sổ \~50ms khi redeem, nhằm ngăn việc dùng cùng một voucher trên hai thiết bị cùng lúc.  
* Rule (Refund Clawback)  
* Khi một đơn hàng bị refund:  
* Hệ thống kiểm tra xem Tcents kiếm được từ đơn đó đã bị tiêu chưa  
* Nếu đã tiêu → số dư Tcent của người dùng được phép âm

## **6\. Tích Hợp API (API Integrations)**

---

### **A. Management API (Dành cho Admin / Merchant)**

**Đối tượng sử dụng**

* Admin TripC

* Chủ nhà hàng / đối tác Merchant

**Tính chất quyền hạn**

* Yêu cầu **quyền truy cập cấp cao** (high-level permissions) do liên quan trực tiếp đến ngân sách và khuyến mãi.

#### **Các Endpoint**

* **POST /v1/vouchers**  
   Tạo mới một mẫu voucher (thiết lập luật áp dụng, ngân sách và thời hạn).

* **PATCH /v1/vouchers/{id}**  
   Vô hiệu hóa voucher khi:

  * Merchant hết hàng / hết suất

  * Chiến dịch hoạt động kém hiệu quả

* **GET /v1/analytics/vouchers**  
   Xem báo cáo:

  * Số lượng voucher đã được **claim**

  * Số lượng voucher đã được **redeem**

    ---

    * **GET /v1/user/balance**  
       Trả về số dư Tcent và Tier hiện tại của người dùng:

       `{`  
    *   `"available": 500,`  
    *   `"pending": 200,`  
    *   `"tier": "BRONZE"`  
    * `}`  
      ---

* **POST /v1/vouchers/exchange**  
   **Input**: `voucher_id`

   **Logic**:

  * Trừ Tcents tương ứng

  * Gán voucher vào ví (wallet) của người dùng

    ---

* **POST /v1/quests/submit**  
   **Input**: `quest_id`, `evidence_url`

   **Logic**:

  * Tạo một bản ghi **PENDING** trong `tcent_ledger`

  * Chờ quy trình duyệt (Admin / AI)

    ---

### **B. Discovery API (Dành cho Người Dùng – AI Điều Khiển)**

**Đối tượng sử dụng**

* Ứng dụng TripC (Front-end)

**Vai trò kinh tế**

* Đây là nơi **hiển thị và kích hoạt động lực khuyến mãi** cho người dùng.

  #### **Các Endpoint**

* **GET /v1/discovery/recommendations**  
   Được AI gọi để tìm các voucher phù hợp theo ngữ cảnh  
   (ví dụ: “Rainy Day”, “Ăn tối tại Đà Nẵng”).

* **POST /v1/my-vouchers/claim**  
   Khi người dùng nhấn **“Nhận Voucher”**, endpoint này:

  * Liên kết `VoucherID` với `UserID`

  * Ghi nhận voucher vào ví người dùng

    ---

### **C. Validation API (Logic Checkout)**

**Đối tượng sử dụng**

* Dịch vụ Checkout

**Triết lý thiết kế**

* Đây là **Source of Truth**

* Xác định voucher là **hợp lệ thực sự** hay chỉ là “lời hứa” (lie vs. reality)

  #### **Endpoint**

* **POST /v1/vouchers/validate**

   **Input**:

  * `voucher_code`

  * `cart_total`

  * `merchant_id`

* **Output**:

  * `200 OK` kèm theo **số tiền giảm giá**

  * `422 Unprocessable Entity` kèm lý do  
     (ví dụ: *“Không đạt mức chi tiêu tối thiểu”*)

* **Lưu ý**:

  * Đây là API **chỉ đọc**

  * **Chưa tiêu thụ voucher** tại bước này

    ---

### **D. Redemption API (Hoàn Tất Giao Dịch)**

**Đối tượng sử dụng**

* Dịch vụ Thanh toán / Đơn hàng (Payment / Order Service)

**Ý nghĩa kinh tế**

* Đánh dấu thời điểm **khoản nợ (voucher)** trở thành **giao dịch tài chính thực tế**

  #### **Endpoint**

* **POST /v1/vouchers/redeem**

   **Chức năng**:

  * Thực thi **atomic transaction**

  * Giảm `total_limit` trong DB

  * Đánh dấu `user_voucher` là **consumed (đã sử dụng)**

* **Ràng buộc**:

  * Chỉ được gọi **sau khi nhận callback thanh toán thành công**  
    * 

## **7\. Quy Tắc Nghiệp Vụ & Kiểm Tra (Business Rules & Validations)**

**Rule 1 (Quy đổi)**  
 Hệ thống phải **bắt buộc** áp dụng tỷ lệ quy đổi **100 Tcents \= 1,00 USD** tại thời điểm checkout.

**Rule 2 (Tính nguyên tử – Atomicity)**  
 Việc **trừ Tcent** và **phát hành Voucher** phải được thực hiện trong **một giao dịch cơ sở dữ liệu duy nhất** nhằm ngăn chặn tình trạng “double spending” (chi tiêu hai lần).

**Rule 3 (Hệ số Tier)**  
 Nếu người dùng có Tier cao hơn Bronze, hệ thống phải áp dụng **hệ số nhân thưởng** (ví dụ: 1,2x) cho **tất cả các hoạt động kiếm Tcent**.

---

## **8\. Nhận Định & Bất Cập (Discrepancies & Observations)**

**Ma sát giao dịch (Transactional Friction)**  
 Không giống các đối thủ như Shopee/Amazon – nơi Tier được tặng voucher “miễn phí”, TripC.ai yêu cầu người dùng phải **“mua” phần thưởng** bằng Tcents hoặc tiền thật. Điều này khiến trải nghiệm nghiêng từ **Loyalty** sang **Grinding** (phải hoàn thành Quest để có quyền được giảm giá).

**Ý nghĩa của Tier Bronze**  
 Dữ liệu hiện tại cho thấy Tier Bronze chủ yếu chỉ dùng để **theo dõi chi tiêu và mức độ tương tác**, không mang lại lợi ích thụ động rõ ràng (như miễn phí vận chuyển, ưu tiên phục vụ). Điều này có thể dẫn đến **tỷ lệ giữ chân thấp** so với tiêu chuẩn ngành.

**Độ trễ xác minh (Verification Lag)**  
 Yêu cầu “thưởng sau khi được duyệt” đối với Quest tạo ra độ trễ, có thể gây thất vọng cho người dùng kỳ vọng **phần thưởng tức thì**, đặc biệt trong bối cảnh du lịch và tiêu dùng tại chỗ.

---

## **9\. Các Dạng Gian Lận (Categories of Abuse – “Hidden Cases”)**

| Loại Gian Lận | Cơ Chế | Tác Động Kinh Doanh |
| ----- | ----- | ----- |
| **Referral Farming** | Tạo hơn 50 tài khoản giả để thu hoạch Tcents từ chương trình “mời bạn bè”. | Làm cạn kiệt ngân sách marketing mà không tạo ra tăng trưởng người dùng thực. |
| **Double Dip** | Cố gắng redeem cùng một voucher đồng thời trên mobile và web. | Tổn thất tài chính do áp dụng nhiều lần giảm giá cho một giao dịch. |
| **Refund Gaming** | Đặt khách sạn giá cao, kiếm 5.000 Tcents, dùng Tcents mua voucher spa rồi hủy đơn để hoàn tiền. | Mất vĩnh viễn giá trị “đã thưởng” dù không có doanh thu thực. |
| **Credential Stuffing** | Dùng bot tự động đăng nhập vào các tài khoản Bronze để rút Tcents/voucher chưa sử dụng. | Xói mòn niềm tin khách hàng và uy tín thương hiệu. |
| **Insider Laundering** | Nhân viên đối tác tạo tài khoản giả để “thu gom” phần thưởng của khách không dùng app. | Chuyển sai động lực ưu đãi, làm lợi cho gian lận thay vì khách du lịch thực. |

