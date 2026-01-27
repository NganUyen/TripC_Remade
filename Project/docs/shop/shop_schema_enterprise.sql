-- ============================================================================
-- TripC SuperApp - Shop Schema (ENTERPRISE Version)
-- ============================================================================
-- Version: 2.0 ENTERPRISE
-- Database: Supabase (PostgreSQL 15+)
-- Last Updated: January 24, 2026
-- Category: /shop
-- Purpose: Full-featured Shopee-level e-commerce platform
-- ============================================================================
-- This is the COMPLETE enterprise schema with ALL advanced features.
-- For MVP (launch version), see: shop_schema_mvp.sql
-- ============================================================================


-- ============================================================================
-- TIER CONFIGS (Earning Rules for TripCent)
-- ============================================================================

CREATE TABLE tier_configs (
  id SERIAL PRIMARY KEY,
  tier_name VARCHAR(50) NOT NULL UNIQUE,
  earning_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  min_spend_threshold DECIMAL(12,2) NOT NULL DEFAULT 0,
  benefits JSONB, -- Additional tier benefits
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default tiers
INSERT INTO tier_configs (tier_name, earning_multiplier, min_spend_threshold) VALUES
  ('BRONZE', 1.00, 0),
  ('SILVER', 1.25, 500),
  ('GOLD', 1.50, 2000),
  ('PLATINUM', 2.00, 5000);

-- ============================================================================
-- BRANDS
-- ============================================================================

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active);

-- ============================================================================
-- CATEGORIES (Enhanced with hierarchy)
-- ============================================================================

-- Drop existing if needed and recreate with hierarchy
-- ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS ...

CREATE TABLE IF NOT EXISTS categories (
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

-- ============================================================================
-- PRODUCTS (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Product type
  product_type VARCHAR(30) NOT NULL DEFAULT 'physical', -- physical | digital | gift_card
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft | active | archived
  
  -- SEO & Metadata
  metadata JSONB,
  tags TEXT[],
  
  -- Ratings (cached, updated by trigger)
  rating_avg DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  
  -- Vector embedding for AI search
  embedding vector(1536),
  
  -- Flags
  is_featured BOOLEAN DEFAULT false,
  is_taxable BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_products_category ON shop_products(category_id);
CREATE INDEX idx_shop_products_brand ON shop_products(brand_id);
CREATE INDEX idx_shop_products_slug ON shop_products(slug);
CREATE INDEX idx_shop_products_status ON shop_products(status);
CREATE INDEX idx_shop_products_type ON shop_products(product_type);
CREATE INDEX idx_shop_products_embedding ON shop_products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_shop_products_tags ON shop_products USING GIN(tags);

-- ============================================================================
-- PRODUCT IMAGES
-- ============================================================================

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

-- ============================================================================
-- PRODUCT VARIANTS
-- ============================================================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  
  sku VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255), -- e.g., "Small / Red"
  
  -- Pricing (in cents for precision)
  price INT NOT NULL CHECK (price >= 0),
  compare_at_price INT, -- Original price for sales
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Inventory
  stock_on_hand INT NOT NULL DEFAULT 0 CHECK (stock_on_hand >= 0),
  low_stock_threshold INT DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- Physical attributes
  weight_grams INT,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);

-- ============================================================================
-- VARIANT OPTIONS (Size, Color, etc.)
-- ============================================================================

CREATE TABLE variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  
  option_name VARCHAR(50) NOT NULL, -- e.g., "Size", "Color"
  option_value VARCHAR(100) NOT NULL, -- e.g., "Small", "Red"
  
  meta JSONB, -- Additional option metadata (hex color, size chart ref, etc.)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_variant_options_variant ON variant_options(variant_id);
CREATE INDEX idx_variant_options_name ON variant_options(option_name);

-- ============================================================================
-- ADDRESSES (User Address Book)
-- ============================================================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  label VARCHAR(50), -- "Home", "Office", etc.
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  postal_code VARCHAR(20),
  
  coordinates GEOGRAPHY(POINT),
  
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses" ON addresses
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ============================================================================
-- SHIPPING METHODS
-- ============================================================================

CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  
  base_fee INT NOT NULL DEFAULT 0, -- cents
  free_shipping_threshold INT, -- Order amount for free shipping (cents)
  
  currency VARCHAR(3) DEFAULT 'USD',
  
  estimated_days_min INT,
  estimated_days_max INT,
  
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CARTS
-- ============================================================================

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- For guest carts
  
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | converted | abandoned
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Optional: Selected shipping/address
  shipping_method_id UUID REFERENCES shipping_methods(id),
  shipping_address_id UUID REFERENCES addresses(id),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- For guest cart cleanup
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

-- ============================================================================
-- CART ITEMS
-- ============================================================================

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  
  qty INT NOT NULL CHECK (qty > 0),
  unit_price INT NOT NULL, -- Snapshot at add time (cents)
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Snapshots for display
  title_snapshot VARCHAR(500),
  variant_snapshot JSONB, -- {sku, options, image_url}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cart_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant ON cart_items(variant_id);

-- ============================================================================
-- VOUCHER TEMPLATES (Admin creates, users redeem with TripCent)
-- ============================================================================

CREATE TABLE voucher_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  terms TEXT, -- Terms and conditions
  
  -- TripCent cost to redeem
  tcent_cost INT NOT NULL CHECK (tcent_cost >= 0),
  
  -- Discount configuration
  discount_mode VARCHAR(20) NOT NULL, -- percent | fixed
  discount_value DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Usage rules
  min_spend_threshold INT DEFAULT 0, -- Minimum order amount (cents)
  max_discount INT, -- Cap for percentage discounts (cents)
  
  -- Inventory
  total_inventory INT, -- NULL = unlimited
  redeemed_count INT DEFAULT 0,
  
  -- Scope
  applicable_to VARCHAR(50) DEFAULT 'all', -- all | category | brand | product
  applicable_ids UUID[], -- Category/Brand/Product IDs if scoped
  
  -- Partner
  merchant_id UUID, -- Partner merchant if applicable
  
  -- Validity
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Voucher validity after redemption
  validity_days INT DEFAULT 30,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voucher_templates_active ON voucher_templates(is_active, starts_at, ends_at);
CREATE INDEX idx_voucher_templates_tcent ON voucher_templates(tcent_cost);

-- ============================================================================
-- USER VOUCHERS (User's redeemed vouchers)
-- ============================================================================

CREATE TABLE shop_user_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES voucher_templates(id),
  
  unique_code VARCHAR(50) UNIQUE NOT NULL, -- For support/audit
  
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | reserved | used | expired | voided
  
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reserved_at TIMESTAMP WITH TIME ZONE, -- When added to cart
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  used_on_order_id UUID, -- Set when used
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_user_vouchers_user_status ON shop_user_vouchers(user_id, status);
CREATE INDEX idx_shop_user_vouchers_template ON shop_user_vouchers(template_id);
CREATE INDEX idx_shop_user_vouchers_code ON shop_user_vouchers(unique_code);
CREATE INDEX idx_shop_user_vouchers_expires ON shop_user_vouchers(expires_at) WHERE status = 'active';

ALTER TABLE shop_user_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vouchers" ON shop_user_vouchers
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ============================================================================
-- VOUCHER REDEMPTIONS (Audit trail)
-- ============================================================================

CREATE TABLE voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  template_id UUID NOT NULL REFERENCES voucher_templates(id),
  user_voucher_id UUID NOT NULL REFERENCES shop_user_vouchers(id),
  tcent_ledger_id UUID REFERENCES tcent_ledger(id), -- The spend transaction
  
  tcent_spent INT NOT NULL,
  
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voucher_redemptions_user ON voucher_redemptions(user_id);
CREATE INDEX idx_voucher_redemptions_template ON voucher_redemptions(template_id);

-- ============================================================================
-- COUPONS (Public promo codes)
-- ============================================================================

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  
  -- Discount
  discount_type VARCHAR(20) NOT NULL, -- percent | fixed
  discount_value INT NOT NULL, -- percent (0-100) or cents
  
  -- Limits
  min_order_subtotal INT DEFAULT 0, -- cents
  max_discount INT, -- Cap for percentage (cents)
  
  -- Validity
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage limits
  usage_limit_total INT, -- NULL = unlimited
  usage_limit_per_user INT DEFAULT 1,
  current_usage_count INT DEFAULT 0,
  
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | expired | disabled
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);

-- ============================================================================
-- COUPON RULES (Scope restrictions)
-- ============================================================================

CREATE TABLE coupon_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  
  scope VARCHAR(50) NOT NULL, -- all | product | category | brand | user_tier
  scope_id UUID, -- Reference ID based on scope
  scope_value VARCHAR(100), -- For tier: 'GOLD', etc.
  
  is_exclude BOOLEAN DEFAULT false, -- true = exclude this scope
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupon_rules_coupon ON coupon_rules(coupon_id);

-- ============================================================================
-- COUPON USAGES
-- ============================================================================

CREATE TABLE coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  user_id UUID REFERENCES users(id),
  order_id UUID NOT NULL,
  
  discount_applied INT NOT NULL, -- Actual discount (cents)
  
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON coupon_usages(coupon_id, user_id);

-- ============================================================================
-- CART DISCOUNTS (Applied discounts on cart)
-- ============================================================================

CREATE TABLE cart_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  
  discount_type VARCHAR(30) NOT NULL, -- user_voucher | coupon | gift_card
  
  user_voucher_id UUID REFERENCES shop_user_vouchers(id),
  coupon_id UUID REFERENCES coupons(id),
  gift_card_id UUID REFERENCES gift_cards(id),
  
  code_snapshot VARCHAR(50),
  amount INT NOT NULL, -- Calculated discount (cents)
  currency VARCHAR(3) DEFAULT 'USD',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cart_id, discount_type, user_voucher_id),
  UNIQUE(cart_id, discount_type, coupon_id),
  UNIQUE(cart_id, discount_type, gift_card_id)
);

CREATE INDEX idx_cart_discounts_cart ON cart_discounts(cart_id);

-- ============================================================================
-- GIFT CARDS
-- ============================================================================

CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  
  initial_balance INT NOT NULL, -- cents
  balance INT NOT NULL, -- Current balance (cents)
  currency VARCHAR(3) DEFAULT 'USD',
  
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | redeemed | expired | disabled
  
  -- Source
  purchased_order_id UUID, -- Order where this was purchased
  issued_to_user_id UUID REFERENCES users(id),
  issued_to_email VARCHAR(255),
  issued_to_name VARCHAR(255),
  
  personal_message TEXT,
  
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_user ON gift_cards(issued_to_user_id);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cart_id UUID REFERENCES carts(id),
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending', 
  -- pending | processing | shipped | delivered | cancelled | refunded
  
  -- Financials (all in cents)
  currency VARCHAR(3) DEFAULT 'USD',
  subtotal INT NOT NULL,
  discount_total INT DEFAULT 0,
  shipping_total INT DEFAULT 0,
  tax_total INT DEFAULT 0,
  grand_total INT NOT NULL,
  
  -- TripCent
  tcent_earned INT DEFAULT 0,
  tcent_used INT DEFAULT 0,
  
  -- Shipping
  shipping_method_id UUID REFERENCES shipping_methods(id),
  shipping_address_snapshot JSONB NOT NULL,
  
  -- Billing
  billing_address_snapshot JSONB,
  
  -- Fulfillment
  tracking_numbers JSONB,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_orders_user ON shop_orders(user_id);
CREATE INDEX idx_shop_orders_number ON shop_orders(order_number);
CREATE INDEX idx_shop_orders_status ON shop_orders(status);
CREATE INDEX idx_shop_orders_created ON shop_orders(created_at);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON shop_orders
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

ALTER PUBLICATION supabase_realtime ADD TABLE shop_orders;

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  
  product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Snapshots (immutable record)
  title_snapshot VARCHAR(500) NOT NULL,
  sku_snapshot VARCHAR(100),
  variant_snapshot JSONB,
  image_url_snapshot VARCHAR(500),
  
  qty INT NOT NULL CHECK (qty > 0),
  unit_price INT NOT NULL, -- cents
  line_total INT NOT NULL, -- qty * unit_price (cents)
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status per item (for partial fulfillment)
  status VARCHAR(30) DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================================
-- ORDER DISCOUNTS (Audit trail)
-- ============================================================================

CREATE TABLE order_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  
  discount_type VARCHAR(30) NOT NULL, -- user_voucher | coupon | gift_card | tcent
  
  user_voucher_id UUID REFERENCES shop_user_vouchers(id),
  coupon_id UUID REFERENCES coupons(id),
  gift_card_id UUID REFERENCES gift_cards(id),
  
  code_snapshot VARCHAR(50),
  title_snapshot VARCHAR(255),
  
  amount INT NOT NULL, -- Discount applied (cents)
  currency VARCHAR(3) DEFAULT 'USD',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_discounts_order ON order_discounts(order_id);

-- ============================================================================
-- PAYMENT INTENTS
-- ============================================================================

CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  
  provider VARCHAR(50) NOT NULL, -- stripe | paypal | momo | etc.
  provider_intent_id VARCHAR(255), -- Provider's payment intent ID
  provider_session_id VARCHAR(255),
  
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- pending | processing | succeeded | failed | cancelled | refunded
  
  amount INT NOT NULL, -- cents
  currency VARCHAR(3) DEFAULT 'USD',
  
  payment_method VARCHAR(50), -- card | bank_transfer | ewallet
  
  metadata JSONB,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_intents_order ON payment_intents(order_id);
CREATE INDEX idx_payment_intents_provider ON payment_intents(provider, provider_intent_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);

-- ============================================================================
-- SHOP WISHLIST (Product-specific)
-- ============================================================================

CREATE TABLE shop_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, product_id, variant_id)
);

CREATE INDEX idx_shop_wishlist_user ON shop_wishlist(user_id);
CREATE INDEX idx_shop_wishlist_product ON shop_wishlist(product_id);

ALTER TABLE shop_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wishlist" ON shop_wishlist
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ============================================================================
-- SHOP REVIEWS
-- ============================================================================

CREATE TABLE shop_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES shop_orders(id) ON DELETE SET NULL,
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  body TEXT,
  
  -- Structured ratings
  quality_rating INT CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)),
  value_rating INT CHECK (value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5)),
  
  photos TEXT[], -- URLs
  
  is_verified_purchase BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending', -- pending | approved | rejected
  
  helpful_count INT DEFAULT 0,
  
  -- Seller response
  seller_response TEXT,
  seller_response_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_reviews_product ON shop_reviews(product_id);
CREATE INDEX idx_shop_reviews_user ON shop_reviews(user_id);
CREATE INDEX idx_shop_reviews_status ON shop_reviews(status);
CREATE INDEX idx_shop_reviews_rating ON shop_reviews(rating);

ALTER TABLE shop_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View approved reviews" ON shop_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users create reviews" ON shop_reviews
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users update own reviews" ON shop_reviews
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'TC-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || 
                        UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
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

-- Update product rating stats
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

-- Reserve voucher when added to cart
CREATE OR REPLACE FUNCTION reserve_voucher(
  p_user_voucher_id UUID,
  p_cart_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_status VARCHAR(20);
BEGIN
  SELECT status INTO v_status 
  FROM shop_user_vouchers 
  WHERE id = p_user_voucher_id FOR UPDATE;
  
  IF v_status = 'active' THEN
    UPDATE shop_user_vouchers
    SET status = 'reserved', reserved_at = NOW()
    WHERE id = p_user_voucher_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Release voucher reservation
CREATE OR REPLACE FUNCTION release_voucher_reservation(
  p_user_voucher_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE shop_user_vouchers
  SET status = 'active', reserved_at = NULL
  WHERE id = p_user_voucher_id AND status = 'reserved';
END;
$$ LANGUAGE plpgsql;

-- Mark voucher as used
CREATE OR REPLACE FUNCTION use_voucher(
  p_user_voucher_id UUID,
  p_order_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE shop_user_vouchers
  SET 
    status = 'used', 
    used_at = NOW(),
    used_on_order_id = p_order_id
  WHERE id = p_user_voucher_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement product stock
CREATE OR REPLACE FUNCTION decrement_stock(
  p_variant_id UUID,
  p_qty INT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_stock INT;
  v_allow_backorder BOOLEAN;
BEGIN
  SELECT stock_on_hand, allow_backorder INTO v_stock, v_allow_backorder
  FROM product_variants
  WHERE id = p_variant_id FOR UPDATE;
  
  IF v_stock >= p_qty OR v_allow_backorder THEN
    UPDATE product_variants
    SET stock_on_hand = stock_on_hand - p_qty, updated_at = NOW()
    WHERE id = p_variant_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Cart totals view
CREATE OR REPLACE VIEW cart_totals AS
SELECT 
  c.id AS cart_id,
  c.user_id,
  c.currency,
  COALESCE(SUM(ci.qty * ci.unit_price), 0) AS subtotal,
  COALESCE(SUM(cd.amount), 0) AS discount_total,
  COALESCE(SUM(ci.qty * ci.unit_price), 0) - COALESCE(SUM(cd.amount), 0) AS total,
  COUNT(DISTINCT ci.id) AS item_count,
  SUM(ci.qty) AS total_qty
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN cart_discounts cd ON c.id = cd.cart_id
WHERE c.status = 'active'
GROUP BY c.id, c.user_id, c.currency;

-- Order summary view
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.*,
  COUNT(oi.id) AS item_count,
  SUM(oi.qty) AS total_qty,
  u.name AS customer_name,
  u.email AS customer_email
FROM shop_orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN users u ON o.user_id = u.id
GROUP BY o.id, u.name, u.email;

-- ============================================================================
-- INVENTORY TRANSACTIONS (Stock movement audit trail)
-- ============================================================================

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  
  transaction_type VARCHAR(30) NOT NULL, -- purchase_order | sale | return | adjustment | transfer
  quantity INT NOT NULL, -- Positive = add, Negative = subtract
  
  -- Reference
  reference_type VARCHAR(30), -- order | refund | adjustment | manual
  reference_id UUID,
  
  -- Context
  reason TEXT,
  performed_by UUID, -- Admin user ID
  
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_variant ON inventory_transactions(variant_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(created_at);

-- ============================================================================
-- TAX CONFIGURATIONS
-- ============================================================================

CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  rate DECIMAL(5,2) NOT NULL, -- e.g., 10.00 for 10%
  
  country VARCHAR(100),
  region VARCHAR(100), -- State/Province
  
  tax_type VARCHAR(50) DEFAULT 'vat', -- vat | sales_tax | gst
  
  is_compound BOOLEAN DEFAULT false, -- Applied on top of other taxes
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  priority INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tax_rates_country ON tax_rates(country, region);

-- Product-specific tax overrides
CREATE TABLE product_tax_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL, -- e.g., "Taxable", "Reduced Rate", "Tax Exempt"
  description TEXT,
  
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link products to tax classes
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS tax_class_id UUID REFERENCES product_tax_classes(id);

-- ============================================================================
-- REFUNDS
-- ============================================================================

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  refund_number VARCHAR(50) UNIQUE NOT NULL,
  
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending | approved | processed | rejected
  reason VARCHAR(100) NOT NULL, -- customer_request | defective | wrong_item | not_received | other
  reason_details TEXT,
  
  -- Amounts (cents)
  subtotal INT NOT NULL,
  shipping_refund INT DEFAULT 0,
  tax_refund INT DEFAULT 0,
  total_refund INT NOT NULL,
  
  -- Method
  refund_method VARCHAR(50), -- original_payment | store_credit | tcent
  tcent_refunded INT DEFAULT 0, -- If refunding as TripCent
  
  -- Tracking
  processed_by UUID, -- Admin who approved
  processed_at TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refunds_order ON refunds(order_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_user ON refunds(user_id);

-- Refund items
CREATE TABLE refund_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_id UUID NOT NULL REFERENCES refunds(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  
  qty INT NOT NULL CHECK (qty > 0),
  amount INT NOT NULL, -- Refund amount for this item (cents)
  
  return_stock BOOLEAN DEFAULT true, -- Add back to inventory
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refund_items_refund ON refund_items(refund_id);

-- ============================================================================
-- ORDER STATUS HISTORY (Audit trail)
-- ============================================================================

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  
  status_from VARCHAR(30),
  status_to VARCHAR(30) NOT NULL,
  
  changed_by_type VARCHAR(30) DEFAULT 'system', -- system | user | admin
  changed_by_id UUID,
  
  notes TEXT,
  metadata JSONB, -- Additional context (tracking info, etc.)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_status ON order_status_history(status_to);

-- ============================================================================
-- PROMOTIONS & FLASH SALES
-- ============================================================================

CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  promotion_type VARCHAR(50) NOT NULL, -- flash_sale | discount | bundle | bogo | free_shipping
  
  -- Discount config (for discount types)
  discount_type VARCHAR(20), -- percent | fixed
  discount_value DECIMAL(10,2),
  max_discount INT, -- cents
  
  -- Rules
  min_quantity INT DEFAULT 1,
  min_spend INT DEFAULT 0, -- cents
  
  -- Scope
  applies_to VARCHAR(50) DEFAULT 'all', -- all | product | category | brand
  applied_ids UUID[],
  
  -- Limits
  usage_limit_total INT,
  usage_limit_per_user INT,
  current_usage INT DEFAULT 0,
  
  -- Schedule
  priority INT DEFAULT 0, -- Higher = applied first
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Display
  banner_url VARCHAR(500),
  badge_text VARCHAR(50), -- e.g., "-20%", "Hot Deal"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_promotions_slug ON promotions(slug);
CREATE INDEX idx_promotions_active ON promotions(is_active, starts_at, ends_at);
CREATE INDEX idx_promotions_type ON promotions(promotion_type);

-- ============================================================================
-- PRODUCT COLLECTIONS (Curated product sets)
-- ============================================================================

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  collection_type VARCHAR(50) DEFAULT 'manual', -- manual | smart (auto rules)
  
  -- Smart collection rules (if type = smart)
  rules JSONB, -- [{field: 'category', operator: 'equals', value: 'electronics'}]
  
  -- Display
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_active ON collections(is_active);

-- Manual collection products
CREATE TABLE collection_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(collection_id, product_id)
);

CREATE INDEX idx_collection_products_collection ON collection_products(collection_id);

-- ============================================================================
-- RECENTLY VIEWED (User browsing history)
-- ============================================================================

CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  
  view_count INT DEFAULT 1,
  first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_recently_viewed_user ON recently_viewed(user_id, last_viewed_at DESC);

ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own history" ON recently_viewed
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ============================================================================
-- PRODUCT COMPARISONS
-- ============================================================================

CREATE TABLE comparison_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- For guests
  
  category_id UUID REFERENCES categories(id), -- Limit to same category
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE comparison_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id UUID NOT NULL REFERENCES comparison_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(comparison_id, product_id)
);

CREATE INDEX idx_comparison_items_list ON comparison_items(comparison_id);

-- ============================================================================
-- SAVED SEARCHES / ALERTS
-- ============================================================================

CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255),
  
  -- Search criteria
  query TEXT,
  filters JSONB, -- {category: [], brand: [], price_min: 0, price_max: 1000}
  
  -- Alert settings
  has_alert BOOLEAN DEFAULT false,
  alert_frequency VARCHAR(20) DEFAULT 'daily', -- instant | daily | weekly
  last_alert_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own searches" ON saved_searches
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ============================================================================
-- STORE CREDITS (Alternative currency)
-- ============================================================================

CREATE TABLE store_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  amount INT NOT NULL, -- cents
  transaction_type VARCHAR(30) NOT NULL, -- refund | reward | gift | adjustment
  
  -- Reference
  reference_type VARCHAR(30), -- refund | promotional | manual
  reference_id UUID,
  
  balance_after INT NOT NULL,
  
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_store_credits_user ON store_credits(user_id);

-- ============================================================================
-- CURRENCY RATES (For multi-currency support)
-- ============================================================================

CREATE TABLE currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  target_currency VARCHAR(3) NOT NULL,
  
  rate DECIMAL(12,6) NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(base_currency, target_currency)
);

CREATE INDEX idx_currency_rates_pair ON currency_rates(base_currency, target_currency);

-- ============================================================================
-- ADDITIONAL HELPER FUNCTIONS
-- ============================================================================

-- Calculate cart/order totals with applied promotions
CREATE OR REPLACE FUNCTION calculate_promotion_discount(
  p_product_id UUID,
  p_variant_id UUID,
  p_quantity INT,
  p_unit_price INT
)
RETURNS INT AS $$
DECLARE
  v_discount INT := 0;
  v_promotion RECORD;
BEGIN
  -- Find applicable active promotions
  FOR v_promotion IN
    SELECT * FROM promotions
    WHERE is_active = true
      AND NOW() BETWEEN starts_at AND ends_at
      AND (applies_to = 'all' OR p_product_id = ANY(applied_ids))
    ORDER BY priority DESC
    LIMIT 1
  LOOP
    IF v_promotion.discount_type = 'percent' THEN
      v_discount := (p_unit_price * p_quantity * v_promotion.discount_value / 100)::INT;
      IF v_promotion.max_discount IS NOT NULL AND v_discount > v_promotion.max_discount THEN
        v_discount := v_promotion.max_discount;
      END IF;
    ELSIF v_promotion.discount_type = 'fixed' THEN
      v_discount := (v_promotion.discount_value * 100)::INT; -- Convert to cents
    END IF;
  END LOOP;
  
  RETURN v_discount;
END;
$$ LANGUAGE plpgsql;

-- Add item to recently viewed (upsert)
CREATE OR REPLACE FUNCTION add_to_recently_viewed(
  p_user_id UUID,
  p_product_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO recently_viewed (user_id, product_id, view_count, last_viewed_at)
  VALUES (p_user_id, p_product_id, 1, NOW())
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET 
    view_count = recently_viewed.view_count + 1,
    last_viewed_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Record inventory transaction
CREATE OR REPLACE FUNCTION record_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock_on_hand != NEW.stock_on_hand THEN
    INSERT INTO inventory_transactions (
      variant_id, 
      transaction_type, 
      quantity, 
      stock_before, 
      stock_after,
      reference_type
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.stock_on_hand > OLD.stock_on_hand THEN 'adjustment'
        ELSE 'sale'
      END,
      NEW.stock_on_hand - OLD.stock_on_hand,
      OLD.stock_on_hand,
      NEW.stock_on_hand,
      'automatic'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_inventory_changes AFTER UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION record_inventory_change();

-- Record order status changes
CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status_from, status_to, changed_by_type)
    VALUES (NEW.id, OLD.status, NEW.status, 'system');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status AFTER UPDATE ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION record_order_status_change();

-- Generate refund number
CREATE OR REPLACE FUNCTION generate_refund_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.refund_number IS NULL THEN
    NEW.refund_number := 'RF-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || 
                         UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_refund_number BEFORE INSERT ON refunds
  FOR EACH ROW EXECUTE FUNCTION generate_refund_number();

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Top selling products (refresh periodically)
CREATE MATERIALIZED VIEW mv_top_selling_products AS
SELECT 
  p.id,
  p.title,
  p.slug,
  c.name AS category_name,
  SUM(oi.qty) AS total_sold,
  SUM(oi.line_total) AS total_revenue,
  COUNT(DISTINCT o.id) AS order_count,
  AVG(sr.rating) AS avg_rating
FROM shop_products p
JOIN order_items oi ON p.id = oi.product_id
JOIN shop_orders o ON oi.order_id = o.id AND o.status IN ('processing', 'shipped', 'delivered')
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN shop_reviews sr ON p.id = sr.product_id AND sr.status = 'approved'
GROUP BY p.id, p.title, p.slug, c.name
ORDER BY total_sold DESC;

CREATE UNIQUE INDEX idx_mv_top_selling ON mv_top_selling_products(id);

-- User purchase summary
CREATE MATERIALIZED VIEW mv_user_purchase_summary AS
SELECT 
  u.id AS user_id,
  COUNT(DISTINCT o.id) AS total_orders,
  SUM(o.grand_total) AS lifetime_spend,
  AVG(o.grand_total) AS avg_order_value,
  MAX(o.created_at) AS last_order_at,
  COUNT(DISTINCT DATE_TRUNC('month', o.created_at)) AS active_months
FROM users u
LEFT JOIN shop_orders o ON u.id = o.user_id AND o.status IN ('processing', 'shipped', 'delivered')
GROUP BY u.id;

CREATE UNIQUE INDEX idx_mv_user_summary ON mv_user_purchase_summary(user_id);

-- ============================================================================
-- ENTERPRISE ONLY: SELLERS / MERCHANTS SYSTEM
-- ============================================================================

CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  shop_name VARCHAR(255) NOT NULL,
  shop_slug VARCHAR(255) UNIQUE NOT NULL,
  shop_logo_url VARCHAR(500),
  shop_banner_url VARCHAR(500),
  shop_description TEXT,
  
  -- Verification
  verification_status VARCHAR(30) DEFAULT 'pending', -- pending | verified | rejected | suspended
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Business info
  business_type VARCHAR(50), -- individual | company
  business_name VARCHAR(255),
  tax_id VARCHAR(100),
  
  -- Contact
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  
  -- Address
  business_address JSONB,
  warehouse_addresses JSONB,
  
  -- Stats (cached)
  total_products INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_revenue BIGINT DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  response_time_hours INT DEFAULT 24,
  
  -- Settings
  auto_accept_orders BOOLEAN DEFAULT true,
  vacation_mode BOOLEAN DEFAULT false,
  vacation_until TIMESTAMP WITH TIME ZONE,
  
  -- Commission
  commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Platform commission %
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sellers_user ON sellers(user_id);
CREATE INDEX idx_sellers_slug ON sellers(shop_slug);
CREATE INDEX idx_sellers_status ON sellers(verification_status);

-- Link products to sellers
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id);
CREATE INDEX IF NOT EXISTS idx_shop_products_seller ON shop_products(seller_id);

-- Seller payouts
CREATE TABLE seller_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id),
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  gross_amount INT NOT NULL,
  commission_amount INT NOT NULL,
  net_amount INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  status VARCHAR(30) DEFAULT 'pending', -- pending | processing | completed | failed
  
  payout_method VARCHAR(50),
  payout_details JSONB,
  
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seller_payouts_seller ON seller_payouts(seller_id);

-- ============================================================================
-- ENTERPRISE ONLY: FLASH DEALS
-- ============================================================================

CREATE TABLE flash_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  banner_url VARCHAR(500),
  
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled | active | ended
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flash_deals_status ON flash_deals(status, starts_at, ends_at);

CREATE TABLE flash_deal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flash_deal_id UUID NOT NULL REFERENCES flash_deals(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  
  flash_price INT NOT NULL,
  original_price INT NOT NULL,
  discount_percent INT GENERATED ALWAYS AS 
    (CASE WHEN original_price > 0 
          THEN ((original_price - flash_price) * 100 / original_price) 
          ELSE 0 END) STORED,
  
  stock_limit INT NOT NULL,
  stock_sold INT DEFAULT 0,
  
  purchase_limit_per_user INT DEFAULT 1,
  
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flash_deal_items_deal ON flash_deal_items(flash_deal_id);

-- ============================================================================
-- ENTERPRISE ONLY: BULK / WHOLESALE PRICING
-- ============================================================================

CREATE TABLE bulk_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  
  min_qty INT NOT NULL,
  max_qty INT,
  
  price INT NOT NULL, -- Price per unit at this tier
  currency VARCHAR(3) DEFAULT 'USD',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(variant_id, min_qty)
);

CREATE INDEX idx_bulk_pricing_variant ON bulk_pricing_tiers(variant_id);

-- ============================================================================
-- ENTERPRISE ONLY: PRODUCT BUNDLES
-- ============================================================================

CREATE TABLE product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  
  bundle_price INT NOT NULL, -- Discounted bundle price
  original_total INT NOT NULL, -- Sum of individual prices
  savings_amount INT GENERATED ALWAYS AS (original_total - bundle_price) STORED,
  
  is_active BOOLEAN DEFAULT true,
  
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  qty INT NOT NULL DEFAULT 1,
  
  UNIQUE(bundle_id, variant_id)
);

CREATE INDEX idx_bundle_items_bundle ON bundle_items(bundle_id);

-- ============================================================================
-- ENTERPRISE ONLY: AFFILIATE MARKETING
-- ============================================================================

CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  affiliate_code VARCHAR(50) UNIQUE NOT NULL,
  
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  
  total_clicks INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  total_earnings INT DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliates_user ON affiliates(user_id);
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);

CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  product_id UUID REFERENCES shop_products(id),
  
  ip_address INET,
  user_agent TEXT,
  referrer_url TEXT,
  
  converted BOOLEAN DEFAULT false,
  order_id UUID REFERENCES shop_orders(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate_id);

CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  order_id UUID NOT NULL REFERENCES shop_orders(id),
  click_id UUID REFERENCES affiliate_clicks(id),
  
  order_amount INT NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount INT NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending | approved | paid | rejected
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliate_commissions_affiliate ON affiliate_commissions(affiliate_id);

-- ============================================================================
-- ENTERPRISE ONLY: NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, 
  -- order_update | promotion | price_drop | back_in_stock | review_reply
  
  title VARCHAR(255) NOT NULL,
  body TEXT,
  
  reference_type VARCHAR(50),
  reference_id UUID,
  
  action_url VARCHAR(500),
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON notifications
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ============================================================================
-- ENTERPRISE ONLY: PRODUCT Q&A
-- ============================================================================

CREATE TABLE product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  
  question TEXT NOT NULL,
  
  is_answered BOOLEAN DEFAULT false,
  answer_count INT DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending | approved | rejected
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_questions_product ON product_questions(product_id);

CREATE TABLE product_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID REFERENCES sellers(id),
  
  answer TEXT NOT NULL,
  
  is_seller_answer BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'approved',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_answers_question ON product_answers(question_id);

-- ============================================================================
-- ENTERPRISE ONLY: CHAT / CONVERSATIONS
-- ============================================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES sellers(id),
  
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  
  buyer_unread_count INT DEFAULT 0,
  seller_unread_count INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(buyer_id, seller_id)
);

CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  
  message_type VARCHAR(30) DEFAULT 'text', -- text | image | product | order
  content TEXT,
  
  -- Attachments
  attachment_url VARCHAR(500),
  product_id UUID REFERENCES shop_products(id),
  order_id UUID REFERENCES shop_orders(id),
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================================================
-- ENTERPRISE SCHEMA SUMMARY
-- ============================================================================
-- Total Tables: 55+
-- MVP Tables: 17
-- Enterprise-Only Tables: 38+
-- 
-- Enterprise Features:
-- - Sellers/Merchants system with verification
-- - Seller payouts and commission tracking
-- - Flash deals with stock limits
-- - Bulk/wholesale pricing tiers
-- - Product bundles
-- - Affiliate marketing program
-- - User notifications
-- - Product Q&A
-- - Buyer-Seller chat
-- - Full inventory audit trail
-- - Tax configuration
-- - Refunds with partial items
-- - Order status history
-- - Promotions & campaigns
-- - Collections (manual + smart)
-- - Recently viewed
-- - Product comparisons
-- - Saved searches with alerts
-- - Store credits
-- - Multi-currency support
-- - Analytics materialized views
-- ============================================================================

