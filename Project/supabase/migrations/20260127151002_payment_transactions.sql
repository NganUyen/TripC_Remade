-- Migration: Create Payment Transactions Table
-- Description: Audit log and idempotency for 3-phase checkout

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    provider VARCHAR(50) NOT NULL, -- 'momo', 'paypal', 'stripe'
    provider_transaction_id VARCHAR(255),
    idempotency_key VARCHAR(255) UNIQUE, -- Critical for webhook retries
    
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded')),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    webhook_payload JSONB, -- Store full payload for audit
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_txn ON payment_transactions(provider, provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payment_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_transactions(status);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_txns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at 
BEFORE UPDATE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION update_payment_txns_updated_at();

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment transactions via booking
CREATE POLICY "Users view own payment transactions" ON payment_transactions
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE user_id = auth.uid()
    )
  );
