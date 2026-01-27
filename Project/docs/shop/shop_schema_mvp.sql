-- ============================================================================
-- TripC SuperApp - Shop Schema (MVP Version 1.0 FIXED)
-- ============================================================================
-- Version: 1.0.1 MVP FIXED
-- Database: Supabase (PostgreSQL 15+)
-- Last Updated: January 25, 2026
-- Purpose: Minimum Viable Product for /shop category
-- ============================================================================
-- CHANGELOG v1.0.1:
-- - FIX #1: Added RLS policy on cart_items
-- - FIX #2: Added coupon_usages table with tracking
-- - FIX #3: Added payment_status column to shop_orders
-- - FIX #4: Fixed order number race condition with sequence
-- - FIX #5: Added order_status_history table
-- - FIX #6: Added data integrity constraints
-- - FIX #7: Fixed stock decrement concurrency with atomic UPDATE
-- ============================================================================

-- Required extensions (should already exist in main schema)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- SECTION 1: CATALOG (Products)
-- ============================================================================

-- Categories (hierarchical)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);

-- Products
CREATE TABLE shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  product_type VARCHAR(30) NOT NULL DEFAULT 'physical', -- physical | digital
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft | active | archived
  
  -- Ratings (cached)
  rating_avg DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  
  -- AI search
  embedding vector(1536),
  
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_products_category ON shop_products(category_id);
CREATE INDEX idx_shop_products_brand ON shop_products(brand_id);
CREATE INDEX idx_shop_products_slug ON shop_products(slug);
CREATE INDEX idx_shop_products_status ON shop_products(status);
CREATE INDEX idx_shop_products_embedding ON shop_products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  alt VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Product Variants (SKUs)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  
  sku VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255),
  
  -- Pricing (cents)
  price INT NOT NULL CHECK (price >= 0),
  compare_at_price INT, -- Original price for sales
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Inventory
  stock_on_hand INT NOT NULL DEFAULT 0 CHECK (stock_on_hand >= 0),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
-- [FIX #7 RELATED] Index for stock queries
CREATE INDEX idx_product_variants_stock ON product_variants(id, stock_on_hand) WHERE is_active = true;

-- Variant Options (Size, Color)
CREATE TABLE variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  option_name VARCHAR(50) NOT NULL,
  option_value VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_variant_options_variant ON variant_options(variant_id);

-- ============================================================================
-- SECTION 2: CART & CHECKOUT
-- ============================================================================

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  label VARCHAR(50),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  postal_code VARCHAR(20),
  
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses" ON addresses
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Shipping Methods
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  base_fee INT NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  estimated_days_min INT,
  estimated_days_max INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carts
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | converted | abandoned
  currency VARCHAR(3) DEFAULT 'USD',
  
  shipping_method_id UUID REFERENCES shipping_methods(id),
  shipping_address_id UUID REFERENCES addresses(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- [FIX #6] Cart must have owner (user_id OR session_id)
  CONSTRAINT cart_must_have_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_carts_status ON carts(status);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own carts" ON carts
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR session_id IS NOT NULL
  );

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  
  qty INT NOT NULL CHECK (qty > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  title_snapshot VARCHAR(500),
  variant_snapshot JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cart_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant ON cart_items(variant_id);

-- [FIX #1] Enable RLS and add policy for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cart items" ON cart_items
  FOR ALL 
  USING (
    cart_id IN (
      SELECT id FROM carts 
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
         OR session_id IS NOT NULL
    )
  )
  WITH CHECK (
    cart_id IN (
      SELECT id FROM carts 
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
         OR session_id IS NOT NULL
    )
  );

-- ============================================================================
-- SECTION 3: ORDERS
-- ============================================================================

-- [FIX #4] Sequence for order numbers to prevent race conditions
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 100000;

-- Orders
CREATE TABLE shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cart_id UUID REFERENCES carts(id),
  
  -- [FIX #3] Separate order status from payment status
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- pending | processing | shipped | delivered | cancelled
  
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- pending | paid | failed | refunded | partial_refund
  
  currency VARCHAR(3) DEFAULT 'USD',
  subtotal INT NOT NULL CHECK (subtotal >= 0),
  discount_total INT DEFAULT 0 CHECK (discount_total >= 0),
  shipping_total INT DEFAULT 0 CHECK (shipping_total >= 0),
  grand_total INT NOT NULL CHECK (grand_total >= 0),
  
  -- TripCent
  tcent_earned INT DEFAULT 0 CHECK (tcent_earned >= 0),
  tcent_used INT DEFAULT 0 CHECK (tcent_used >= 0),
  
  shipping_method_id UUID REFERENCES shipping_methods(id),
  shipping_address_snapshot JSONB NOT NULL,
  
  tracking_numbers JSONB,
  
  customer_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_orders_user ON shop_orders(user_id);
CREATE INDEX idx_shop_orders_number ON shop_orders(order_number);
CREATE INDEX idx_shop_orders_status ON shop_orders(status);
-- [FIX #3] Index for payment status queries
CREATE INDEX idx_shop_orders_payment_status ON shop_orders(payment_status);
-- Composite index for common query patterns
CREATE INDEX idx_shop_orders_user_status ON shop_orders(user_id, status, payment_status);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON shop_orders
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

ALTER PUBLICATION supabase_realtime ADD TABLE shop_orders;

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  
  product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  title_snapshot VARCHAR(500) NOT NULL,
  sku_snapshot VARCHAR(100),
  variant_snapshot JSONB,
  image_url_snapshot VARCHAR(500),
  
  qty INT NOT NULL CHECK (qty > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  line_total INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- [FIX #6] Ensure line_total matches qty * unit_price
  CONSTRAINT line_total_matches CHECK (line_total = qty * unit_price)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- [FIX #5] Order Status History for audit trail
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  
  old_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  old_payment_status VARCHAR(30),
  new_payment_status VARCHAR(30),
  
  changed_by_type VARCHAR(30) DEFAULT 'system', -- system | user | admin
  changed_by_id UUID,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created ON order_status_history(created_at);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order history" ON order_status_history
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM shop_orders 
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    )
  );

-- ============================================================================
-- SECTION 4: VOUCHERS & COUPONS (Basic)
-- ============================================================================

-- Voucher Templates
CREATE TABLE voucher_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  tcent_cost INT NOT NULL CHECK (tcent_cost >= 0),
  
  discount_mode VARCHAR(20) NOT NULL CHECK (discount_mode IN ('percent', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  min_spend_threshold INT DEFAULT 0 CHECK (min_spend_threshold >= 0),
  
  total_inventory INT CHECK (total_inventory IS NULL OR total_inventory > 0),
  redeemed_count INT DEFAULT 0 CHECK (redeemed_count >= 0),
  
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  validity_days INT DEFAULT 30 CHECK (validity_days > 0),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- [FIX #6] Ensure ends_at > starts_at when both are set
  CONSTRAINT valid_voucher_dates CHECK (
    starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at
  )
);

CREATE INDEX idx_voucher_templates_active ON voucher_templates(is_active, starts_at, ends_at);

-- User Vouchers
CREATE TABLE shop_user_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES voucher_templates(id),
  
  unique_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  used_on_order_id UUID REFERENCES shop_orders(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_user_vouchers_user ON shop_user_vouchers(user_id, status);

ALTER TABLE shop_user_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vouchers" ON shop_user_vouchers
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Coupons (Public promo codes)
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255),
  
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value INT NOT NULL CHECK (discount_value > 0),
  
  min_order_subtotal INT DEFAULT 0 CHECK (min_order_subtotal >= 0),
  
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  usage_limit_total INT CHECK (usage_limit_total IS NULL OR usage_limit_total > 0),
  usage_limit_per_user INT DEFAULT 1 CHECK (usage_limit_per_user > 0),
  current_usage_count INT DEFAULT 0 CHECK (current_usage_count >= 0),
  
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- [FIX #6] Ensure ends_at > starts_at when both are set
  CONSTRAINT valid_coupon_dates CHECK (
    starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at
  )
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);

-- [FIX #2] Coupon Usage Tracking Table
CREATE TABLE coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  
  discount_applied INT NOT NULL CHECK (discount_applied > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate coupon usage on same order
  UNIQUE(coupon_id, order_id)
);

CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON coupon_usages(coupon_id, user_id);
CREATE INDEX idx_coupon_usages_order ON coupon_usages(order_id);

-- ============================================================================
-- SECTION 5: PAYMENTS
-- ============================================================================

CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  
  provider VARCHAR(50) NOT NULL,
  provider_intent_id VARCHAR(255),
  
  status VARCHAR(30) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  
  amount INT NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  payment_method VARCHAR(50),
  
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_intents_order ON payment_intents(order_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);
CREATE INDEX idx_payment_intents_provider ON payment_intents(provider, provider_intent_id);

-- ============================================================================
-- SECTION 6: USER FEATURES
-- ============================================================================

-- Wishlist
CREATE TABLE shop_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_shop_wishlist_user ON shop_wishlist(user_id);

ALTER TABLE shop_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wishlist" ON shop_wishlist
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Reviews
CREATE TABLE shop_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES shop_orders(id),
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  body TEXT,
  
  photos TEXT[],
  
  is_verified_purchase BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_reviews_product ON shop_reviews(product_id);
CREATE INDEX idx_shop_reviews_user ON shop_reviews(user_id);
CREATE INDEX idx_shop_reviews_status ON shop_reviews(status);

ALTER TABLE shop_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View approved reviews" ON shop_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users create reviews" ON shop_reviews
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users update own reviews" ON shop_reviews
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ============================================================================
-- SECTION 7: TRIGGERS & FUNCTIONS
-- ============================================================================

-- [FIX #4] Generate order number using sequence (prevents race condition)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'TC-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || 
                        LPAD(nextval('order_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Generate voucher code
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_code IS NULL THEN
    NEW.unique_code := 'V-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_voucher_code BEFORE INSERT ON shop_user_vouchers
  FOR EACH ROW EXECUTE FUNCTION generate_voucher_code();

-- Update product rating
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shop_products
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) 
      FROM shop_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
        AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM shop_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
        AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_ratings AFTER INSERT OR UPDATE OR DELETE ON shop_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating_stats();

-- [FIX #7] Atomic stock decrement (prevents overselling)
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id UUID, p_qty INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_rows_updated INT;
BEGIN
  -- Single atomic UPDATE with WHERE clause preventing overselling
  UPDATE product_variants
  SET stock_on_hand = stock_on_hand - p_qty, 
      updated_at = NOW()
  WHERE id = p_variant_id 
    AND stock_on_hand >= p_qty
    AND is_active = true;
  
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- [FIX #5] Record order status changes
CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if status or payment_status changed
  IF OLD.status IS DISTINCT FROM NEW.status 
     OR OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    INSERT INTO order_status_history (
      order_id, 
      old_status, 
      new_status, 
      old_payment_status, 
      new_payment_status,
      changed_by_type
    )
    VALUES (
      NEW.id, 
      OLD.status, 
      NEW.status, 
      OLD.payment_status, 
      NEW.payment_status,
      'system'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_changed AFTER UPDATE ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION record_order_status_change();

-- [FIX #2] Increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET current_usage_count = current_usage_count + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coupon_used AFTER INSERT ON coupon_usages
  FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- [FIX #2] Check if user can use coupon
CREATE OR REPLACE FUNCTION can_use_coupon(p_coupon_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INT;
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon FROM coupons WHERE id = p_coupon_id;
  
  -- Check if coupon exists and is active
  IF v_coupon IS NULL OR v_coupon.status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- Check date validity
  IF v_coupon.starts_at IS NOT NULL AND NOW() < v_coupon.starts_at THEN
    RETURN FALSE;
  END IF;
  
  IF v_coupon.ends_at IS NOT NULL AND NOW() > v_coupon.ends_at THEN
    RETURN FALSE;
  END IF;
  
  -- Check total usage limit
  IF v_coupon.usage_limit_total IS NOT NULL 
     AND v_coupon.current_usage_count >= v_coupon.usage_limit_total THEN
    RETURN FALSE;
  END IF;
  
  -- Check per-user usage limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM coupon_usages
  WHERE coupon_id = p_coupon_id AND user_id = p_user_id;
  
  IF v_user_usage_count >= v_coupon.usage_limit_per_user THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_orders_updated_at BEFORE UPDATE ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON payment_intents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 8: HELPER FUNCTIONS
-- ============================================================================

-- Check if product variant is available for purchase
CREATE OR REPLACE FUNCTION is_product_available(p_variant_id UUID, p_qty INT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM product_variants pv
    JOIN shop_products sp ON pv.product_id = sp.id
    WHERE pv.id = p_variant_id
      AND pv.stock_on_hand >= p_qty
      AND pv.is_active = true
      AND sp.status = 'active'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SECTION 9: VIEWS
-- ============================================================================

-- Cart totals (basic)
CREATE OR REPLACE VIEW cart_totals AS
SELECT 
  c.id AS cart_id,
  c.user_id,
  c.currency,
  COALESCE(SUM(ci.qty * ci.unit_price), 0) AS subtotal,
  COUNT(DISTINCT ci.id) AS item_count,
  SUM(ci.qty) AS total_qty
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
WHERE c.status = 'active'
GROUP BY c.id, c.user_id, c.currency;

-- Cart summary (with shipping)
CREATE OR REPLACE VIEW cart_summary AS
SELECT 
  c.id AS cart_id,
  c.user_id,
  c.session_id,
  c.currency,
  c.status,
  COALESCE(SUM(ci.qty * ci.unit_price), 0) AS subtotal,
  COUNT(DISTINCT ci.id) AS item_count,
  SUM(ci.qty) AS total_qty,
  COALESCE(sm.base_fee, 0) AS shipping_fee,
  COALESCE(SUM(ci.qty * ci.unit_price), 0) + COALESCE(sm.base_fee, 0) AS estimated_total,
  c.created_at,
  c.updated_at
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN shipping_methods sm ON c.shipping_method_id = sm.id
WHERE c.status = 'active'
GROUP BY c.id, c.user_id, c.session_id, c.currency, c.status, 
         sm.base_fee, c.created_at, c.updated_at;

-- ============================================================================
-- SECTION 10: PERFORMANCE INDEXES
-- ============================================================================

-- Enable trigram extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Text search on product titles
CREATE INDEX IF NOT EXISTS idx_shop_products_title_trgm 
  ON shop_products USING gin(title gin_trgm_ops);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_shop_orders_user_created 
  ON shop_orders(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_product_approved 
  ON shop_reviews(product_id, status) 
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_product_variants_available 
  ON product_variants(product_id, stock_on_hand)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_shop_products_featured 
  ON shop_products(is_featured, status)
  WHERE is_featured = true AND status = 'active';

-- Additional updated_at trigger
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MVP SCHEMA v1.0.2 FINAL SUMMARY
-- ============================================================================
-- Tables: 18
-- - Catalog: categories, brands, shop_products, product_images, product_variants, variant_options
-- - Cart: addresses, shipping_methods, carts, cart_items
-- - Orders: shop_orders, order_items, order_status_history
-- - Vouchers: voucher_templates, shop_user_vouchers, coupons, coupon_usages
-- - Payments: payment_intents
-- - User: shop_wishlist, shop_reviews
--
-- Fixes Applied (v1.0.1):
-- 1. [SECURITY] cart_items RLS policy
-- 2. [DATA] coupon_usages + can_use_coupon()
-- 3. [BUSINESS] payment_status column
-- 4. [CONCURRENCY] order_number_seq
-- 5. [AUDIT] order_status_history + trigger
-- 6. [INTEGRITY] CHECK constraints
-- 7. [CONCURRENCY] Atomic decrement_stock()
--
-- Performance (v1.0.2):
-- 8. [PERF] pg_trgm text search index
-- 9. [PERF] Composite indexes for queries
-- 10. [HELPER] is_product_available() function
-- 11. [VIEW] cart_summary with shipping
-- ============================================================================
