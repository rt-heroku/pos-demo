-- Test voucher data for testing the voucher system
-- Run this after the voucher_implementation.sql migration

-- Insert a test customer if not exists
INSERT INTO customers (loyalty_number, name, first_name, last_name, email, phone, points, member_status, member_type, enrollment_date, customer_tier, created_at) 
VALUES ('LOY001', 'Test Customer', 'Test', 'Customer', 'test@example.com', '555-0123', 100, 'Active', 'Individual', CURRENT_DATE, 'Bronze', CURRENT_TIMESTAMP)
ON CONFLICT (loyalty_number) DO NOTHING;

-- Get the customer ID
-- Insert test vouchers for the customer
INSERT INTO customer_vouchers (
    customer_id, voucher_code,product_id, name, status, voucher_type, 
    face_value, discount_percent, remaining_value, 
    description, is_active, expiration_date, created_date
) VALUES 
-- Value voucher
((SELECT id FROM customers WHERE loyalty_number = 'LOY007'), 'VALUE001', 529, 'Test Value Voucher', 'Issued', 'Value', 25.00, NULL, 25.00, 'Test value voucher for $25', true, CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP),

-- Discount voucher  
((SELECT id FROM customers WHERE loyalty_number = 'LOY007'), 'DISCOUNT001', 529, 'Test Discount Voucher', 'Issued', 'Discount', NULL, 15.00, NULL, 'Test 15% discount voucher', true, CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP),

-- Product-specific voucher (assuming product ID 1 exists)
((SELECT id FROM customers WHERE loyalty_number = 'LOY007'), 'PRODUCT001', 529, 'Test Product Voucher', 'Issued', 'ProductSpecific', NULL, 20.00, NULL, 'Test 20% off specific product', true, CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP);

-- Update the product_id for the product-specific voucher if products exist
UPDATE customer_vouchers 
SET product_id = (SELECT id FROM products LIMIT 1)
WHERE voucher_code = 'PRODUCT001' 
AND EXISTS (SELECT 1 FROM products LIMIT 1);
