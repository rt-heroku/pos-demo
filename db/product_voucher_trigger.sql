-- Product Voucher Trigger
-- Automatically sets discount_percent = 100 for ProductSpecific vouchers with null discount_percent

-- Create trigger function
CREATE OR REPLACE FUNCTION set_product_voucher_discount()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if voucher_type is 'ProductSpecific' and discount_percent is null
    IF NEW.voucher_type = 'ProductSpecific' AND NEW.discount_percent IS NULL THEN
        NEW.discount_percent = 100;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on customer_vouchers table
DROP TRIGGER IF EXISTS trigger_set_product_voucher_discount ON customer_vouchers;
CREATE TRIGGER trigger_set_product_voucher_discount
    BEFORE INSERT ON customer_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION set_product_voucher_discount();

-- Test the trigger with sample data
-- This will be commented out in production
/*
-- Test case 1: ProductSpecific voucher with null discount_percent (should be set to 100)
INSERT INTO customer_vouchers (
    sf_id, customer_id, voucher_code, name, status, voucher_type, 
    face_value, product_id, remaining_value, description, 
    is_active, effective_date, expiration_date, created_date
) VALUES (
    'TEST001', 1, 'FREE_FRIES', 'Free Fries Voucher', 'Active', 'ProductSpecific',
    0, 1, 0, 'Free fries with any purchase', 
    true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP
);

-- Test case 2: ProductSpecific voucher with existing discount_percent (should remain unchanged)
INSERT INTO customer_vouchers (
    sf_id, customer_id, voucher_code, name, status, voucher_type, 
    face_value, discount_percent, product_id, remaining_value, description, 
    is_active, effective_date, expiration_date, created_date
) VALUES (
    'TEST002', 1, 'HALF_FRIES', 'Half Price Fries', 'Active', 'ProductSpecific',
    0, 50, 1, 0, '50% off fries', 
    true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP
);

-- Test case 3: Non-ProductSpecific voucher with null discount_percent (should remain null)
INSERT INTO customer_vouchers (
    sf_id, customer_id, voucher_code, name, status, voucher_type, 
    face_value, remaining_value, description, 
    is_active, effective_date, expiration_date, created_date
) VALUES (
    'TEST003', 1, 'DISCOUNT_10', '10% Off Everything', 'Active', 'Discount',
    0, 0, '10% discount on all items', 
    true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP
);
*/
