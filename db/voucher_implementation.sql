-- Voucher System Implementation
-- Database schema for customer vouchers

-- 1. Create customer_vouchers table
CREATE TABLE customer_vouchers (
    id SERIAL PRIMARY KEY,
    sf_id VARCHAR(100) UNIQUE, -- Salesforce ID
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    voucher_code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Redeemed', 'Expired', 'Cancelled', 'Reserved')),
    
    voucher_type VARCHAR(50) NOT NULL CHECK (voucher_type IN ('Value', 'Discount', 'ProductSpecific')),
    face_value DECIMAL(10,2), -- Original value for value vouchers
    discount_percent DECIMAL(5,2), -- Percentage discount (0-100)
    product_id INTEGER REFERENCES products(id), -- For product-specific vouchers
    
    -- Value tracking for value vouchers
    remaining_value DECIMAL(10,2), -- Remaining balance for value vouchers
    redeemed_value DECIMAL(10,2) DEFAULT 0, -- Amount already redeemed
    reserved_value DECIMAL(10,2) DEFAULT 0, -- Amount reserved in current transaction
    
    -- Dates
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiration_date DATE,
    use_date TIMESTAMP, -- When voucher was last used
    
    -- Metadata
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    effective_date DATE DEFAULT CURRENT_DATE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user INTEGER
);

-- 2. Add voucher_id to transaction_items table
ALTER TABLE transaction_items 
ADD COLUMN voucher_id INTEGER REFERENCES customer_vouchers(id);

-- 3. Create indexes for performance
CREATE INDEX idx_customer_vouchers_customer_id ON customer_vouchers(customer_id);
CREATE INDEX idx_customer_vouchers_status ON customer_vouchers(status);
CREATE INDEX idx_customer_vouchers_expiration ON customer_vouchers(expiration_date);
CREATE INDEX idx_customer_vouchers_type ON customer_vouchers(voucher_type);
CREATE INDEX idx_transaction_items_voucher_id ON transaction_items(voucher_id);

-- 4. Create function to check voucher validity
CREATE OR REPLACE FUNCTION is_voucher_valid(voucher_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    voucher_record RECORD;
BEGIN
    SELECT * INTO voucher_record 
    FROM customer_vouchers 
    WHERE id = voucher_id;
    
    -- Check if voucher exists and is active
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if voucher is issued and not expired
    IF voucher_record.status != 'Issued' THEN
        RETURN FALSE;
    END IF;
    
    -- Check expiration date
    IF voucher_record.expiration_date IS NOT NULL AND voucher_record.expiration_date < CURRENT_DATE THEN
        RETURN FALSE;
    END IF;
    
    -- Check if voucher is active
    IF NOT voucher_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- For value vouchers, check if there's remaining value
    IF voucher_record.voucher_type = 'Value' AND voucher_record.remaining_value <= 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to calculate voucher discount
CREATE OR REPLACE FUNCTION calculate_voucher_discount(
    voucher_id INTEGER,
    item_price DECIMAL(10,2),
    product_id INTEGER DEFAULT NULL
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    voucher_record RECORD;
    discount_amount DECIMAL(10,2) := 0;
BEGIN
    -- Get voucher details
    SELECT * INTO voucher_record 
    FROM customer_vouchers 
    WHERE id = voucher_id;
    
    -- Check if voucher is valid
    IF NOT is_voucher_valid(voucher_id) THEN
        RETURN 0;
    END IF;
    
    -- Calculate discount based on voucher type
    CASE voucher_record.voucher_type
        WHEN 'Value' THEN
            -- For value vouchers, discount is the minimum of item price or remaining value
            discount_amount := LEAST(item_price, voucher_record.remaining_value);
            
        WHEN 'Discount' THEN
            -- For percentage discount
            discount_amount := item_price * (voucher_record.discount_percent / 100);
            
        WHEN 'ProductSpecific' THEN
            -- Only apply if product matches
            IF product_id IS NOT NULL AND voucher_record.product_id = product_id THEN
                IF voucher_record.discount_percent IS NOT NULL THEN
                    discount_amount := item_price * (voucher_record.discount_percent / 100);
                ELSIF voucher_record.face_value IS NOT NULL THEN
                    discount_amount := LEAST(item_price, voucher_record.face_value);
                END IF;
            END IF;
            
        ELSE
            discount_amount := 0;
    END CASE;
    
    RETURN discount_amount;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to update voucher when used
CREATE OR REPLACE FUNCTION update_voucher_on_use()
RETURNS TRIGGER AS $$
DECLARE
    voucher_record RECORD;
BEGIN
    -- If voucher_id is set, update the voucher
    IF NEW.voucher_id IS NOT NULL THEN
        SELECT * INTO voucher_record 
        FROM customer_vouchers 
        WHERE id = NEW.voucher_id;
        
        -- Update voucher based on type
        IF voucher_record.voucher_type = 'Value' THEN
            -- For value vouchers, reduce remaining value
            UPDATE customer_vouchers 
            SET 
                remaining_value = remaining_value - NEW.discount_amount,
                redeemed_value = redeemed_value + NEW.discount_amount,
                use_date = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.voucher_id;
            
            -- If remaining value is 0, mark as redeemed
            IF (voucher_record.remaining_value - NEW.discount_amount) <= 0 THEN
                UPDATE customer_vouchers 
                SET status = 'Redeemed'
                WHERE id = NEW.voucher_id;
            END IF;
            
        ELSE
            -- For other voucher types, mark as redeemed
            UPDATE customer_vouchers 
            SET 
                status = 'Redeemed',
                use_date = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.voucher_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_voucher_on_use
    AFTER INSERT ON transaction_items
    FOR EACH ROW
    EXECUTE FUNCTION update_voucher_on_use();

-- 7. Create view for active vouchers
CREATE VIEW active_customer_vouchers AS
SELECT 
    cv.*,
    c.name as customer_name,
    c.loyalty_number,
    p.name as product_name
FROM customer_vouchers cv
JOIN customers c ON cv.customer_id = c.id
LEFT JOIN products p ON cv.product_id = p.id
WHERE cv.status = 'Issued' 
    AND cv.is_active = true
    AND (cv.expiration_date IS NULL OR cv.expiration_date >= CURRENT_DATE)
    AND (cv.voucher_type != 'Value' OR cv.remaining_value > 0);
