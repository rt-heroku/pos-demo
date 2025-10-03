-- Transaction Vouchers Implementation
-- This script creates the transaction_vouchers table and updates the voucher system
-- to properly track voucher usage in transactions

-- Create transaction_vouchers table
CREATE TABLE IF NOT EXISTS transaction_vouchers (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    voucher_id INTEGER NOT NULL REFERENCES customer_vouchers(id) ON DELETE CASCADE,
    applied_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transaction_vouchers_transaction_id ON transaction_vouchers(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_vouchers_voucher_id ON transaction_vouchers(voucher_id);

-- Update customer_vouchers table to add redeemed_value and use_date columns if they don't exist
DO $$ 
BEGIN
    -- Add redeemed_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_vouchers' AND column_name = 'redeemed_value') THEN
        ALTER TABLE customer_vouchers ADD COLUMN redeemed_value DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add use_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_vouchers' AND column_name = 'use_date') THEN
        ALTER TABLE customer_vouchers ADD COLUMN use_date TIMESTAMP;
    END IF;
END $$;

-- Create function to update voucher status when redeemed
CREATE OR REPLACE FUNCTION update_voucher_on_redemption()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the voucher status to 'Redeemed' and set use_date
    UPDATE customer_vouchers 
    SET 
        status = 'Redeemed',
        redeemed_value = redeemed_value + NEW.applied_amount,
        remaining_value = GREATEST(0, remaining_value - NEW.applied_amount),
        use_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.voucher_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update voucher status when transaction_vouchers is inserted
DROP TRIGGER IF EXISTS trigger_update_voucher_on_redemption ON transaction_vouchers;
CREATE TRIGGER trigger_update_voucher_on_redemption
    AFTER INSERT ON transaction_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_voucher_on_redemption();

-- Create function to calculate voucher discount amount
CREATE OR REPLACE FUNCTION calculate_voucher_discount_amount(
    p_voucher_id INTEGER,
    p_item_subtotal DECIMAL(10,2)
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_voucher customer_vouchers%ROWTYPE;
    v_discount_amount DECIMAL(10,2) := 0.00;
BEGIN
    -- Get voucher details
    SELECT * INTO v_voucher FROM customer_vouchers WHERE id = p_voucher_id;
    
    IF NOT FOUND THEN
        RETURN 0.00;
    END IF;
    
    -- Calculate discount based on voucher type
    CASE v_voucher.voucher_type
        WHEN 'Value' THEN
            -- For value vouchers, use the applied amount
            v_discount_amount := LEAST(p_item_subtotal, v_voucher.remaining_value);
        WHEN 'Discount' THEN
            -- For discount vouchers, calculate percentage
            v_discount_amount := p_item_subtotal * (v_voucher.discount_percent / 100);
        WHEN 'ProductSpecific' THEN
            -- For product-specific vouchers
            IF v_voucher.discount_percent IS NOT NULL THEN
                v_discount_amount := p_item_subtotal * (v_voucher.discount_percent / 100);
            ELSIF v_voucher.face_value IS NOT NULL THEN
                v_discount_amount := LEAST(p_item_subtotal, v_voucher.face_value);
            END IF;
    END CASE;
    
    RETURN v_discount_amount;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate voucher eligibility
CREATE OR REPLACE FUNCTION is_voucher_eligible_for_transaction(
    p_voucher_id INTEGER,
    p_customer_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_voucher customer_vouchers%ROWTYPE;
BEGIN
    -- Get voucher details
    SELECT * INTO v_voucher FROM customer_vouchers WHERE id = p_voucher_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if voucher belongs to customer
    IF v_voucher.customer_id != p_customer_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check if voucher is active and not expired
    IF v_voucher.status != 'Issued' OR NOT v_voucher.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- Check expiration date
    IF v_voucher.expiration_date IS NOT NULL AND v_voucher.expiration_date < CURRENT_TIMESTAMP THEN
        RETURN FALSE;
    END IF;
    
    -- Check if voucher has remaining value
    IF v_voucher.remaining_value IS NOT NULL AND v_voucher.remaining_value <= 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE transaction_vouchers IS 'Tracks which vouchers were applied to which transactions';
COMMENT ON COLUMN transaction_vouchers.applied_amount IS 'The amount of the voucher that was applied (for value vouchers)';
COMMENT ON COLUMN transaction_vouchers.discount_amount IS 'The actual discount amount calculated and applied';
COMMENT ON FUNCTION update_voucher_on_redemption() IS 'Updates voucher status when it is redeemed in a transaction';
COMMENT ON FUNCTION calculate_voucher_discount_amount(INTEGER, DECIMAL) IS 'Calculates the discount amount for a voucher based on item subtotal';
COMMENT ON FUNCTION is_voucher_eligible_for_transaction(INTEGER, INTEGER) IS 'Validates if a voucher is eligible for use in a transaction';
