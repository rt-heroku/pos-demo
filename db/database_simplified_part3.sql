-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger to update customer tier and stats
CREATE OR REPLACE FUNCTION update_customer_tier_and_stats() RETURNS TRIGGER AS $$
DECLARE
    new_tier VARCHAR(20);
    new_calculation_number DECIMAL;
BEGIN
    -- Update customer statistics
    UPDATE customers 
    SET 
        points = points + NEW.points_earned - COALESCE(NEW.points_redeemed, 0),
        total_spent = total_spent + NEW.total,
        visit_count = visit_count + 1,
        last_visit = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;
    
    -- Get updated customer data for tier calculation
    SELECT 
        calculate_customer_tier(total_spent + NEW.total, visit_count + 1, points + NEW.points_earned - COALESCE(NEW.points_redeemed, 0)),
        calculate_tier_number(total_spent + NEW.total, visit_count + 1, points + NEW.points_earned - COALESCE(NEW.points_redeemed, 0), 
                             calculate_customer_tier(total_spent + NEW.total, visit_count + 1, points + NEW.points_earned - COALESCE(NEW.points_redeemed, 0)))
    INTO new_tier, new_calculation_number
    FROM customers 
    WHERE id = NEW.customer_id;
    
    -- Update tier and calculation number
    UPDATE customers 
    SET 
        customer_tier = new_tier,
        tier_calculation_number = new_calculation_number
    WHERE id = NEW.customer_id;
    
    -- Log the purchase activity
    PERFORM log_customer_activity(
        NEW.customer_id,
        'purchase',
        'Purchase transaction #' || NEW.id || ' - Tier: ' || new_tier,
        NEW.points_earned - COALESCE(NEW.points_redeemed, 0),
        NEW.id,
        'pos_system'
    );
    
    -- Log tier change if applicable
    IF EXISTS (
        SELECT 1 FROM customers 
        WHERE id = NEW.customer_id 
        AND customer_tier != new_tier
    ) THEN
        PERFORM log_customer_activity(
            NEW.customer_id,
            'tier_change',
            'Customer tier updated to ' || new_tier,
            0,
            NEW.id,
            'auto_calculation'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_tier_and_stats
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_tier_and_stats();

-- Trigger to auto-generate work order numbers
CREATE OR REPLACE FUNCTION set_work_order_number() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.work_order_number IS NULL OR NEW.work_order_number = '' THEN
        NEW.work_order_number := generate_work_order_number(NEW.location_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_work_order_number
    BEFORE INSERT ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_work_order_number();

-- Trigger to update location inventory after transactions
CREATE OR REPLACE FUNCTION update_location_inventory() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO location_inventory (location_id, product_id, quantity)
    SELECT 
        NEW.location_id,
        ti.product_id,
        -ti.quantity
    FROM transaction_items ti
    WHERE ti.transaction_id = NEW.id
    ON CONFLICT (location_id, product_id)
    DO UPDATE SET 
        quantity = location_inventory.quantity - EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_inventory
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_location_inventory();

-- Trigger to log work order status changes
CREATE OR REPLACE FUNCTION log_work_order_status_change() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO work_order_status_history 
        (work_order_id, old_status, new_status, changed_by, change_reason)
        VALUES 
        (NEW.id, OLD.status, NEW.status, 'System', 'Status updated');
    END IF;
    
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_work_order_status_change
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_work_order_status_change();

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Location inventory view
CREATE OR REPLACE VIEW location_inventory_view AS
SELECT 
    li.*,
    p.name as product_name,
    p.sku,
    p.price,
    p.category,
    l.store_name,
    l.store_code,
    (li.quantity <= li.reorder_level) as needs_reorder
FROM location_inventory li
JOIN products p ON li.product_id = p.id
JOIN locations l ON li.location_id = l.id
WHERE l.is_active = true;

-- Work orders summary view
CREATE OR REPLACE VIEW work_orders_summary AS
SELECT 
    wo.*,
    c.name as customer_name,
    c.loyalty_number,
    c.email as customer_email,
    l.store_name,
    l.store_code,
    COUNT(wop.id) as product_count
FROM work_orders wo
JOIN customers c ON wo.customer_id = c.id
JOIN locations l ON wo.location_id = l.id
LEFT JOIN work_order_products wop ON wo.id = wop.work_order_id
GROUP BY wo.id, c.name, c.loyalty_number, c.email, l.store_name, l.store_code;

-- Enhanced customer dashboard view
CREATE OR REPLACE VIEW enhanced_customer_dashboard AS
SELECT 
    c.id,
    c.loyalty_number,
    c.name,
    c.email,
    c.phone,
    c.points,
    c.total_spent,
    c.visit_count,
    c.last_visit,
    c.created_at,
    c.member_status,
    c.enrollment_date,
    c.member_type,
    c.customer_tier,
    c.tier_calculation_number,
    c.notes,
    
    EXTRACT(DAY FROM CURRENT_DATE - c.enrollment_date::DATE) as days_since_enrollment,
    
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.enrollment_date::DATE)) >= 1 THEN
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.enrollment_date::DATE))::TEXT || ' years'
        ELSE
            EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.enrollment_date::DATE))::TEXT || ' months'
    END as member_duration,
    
    CASE 
        WHEN c.member_status != 'Active' THEN c.member_status
        WHEN c.last_visit >= CURRENT_DATE - INTERVAL '30 days' THEN 'Recently Active'
        WHEN c.last_visit >= CURRENT_DATE - INTERVAL '90 days' THEN 'Moderately Active'
        WHEN c.last_visit IS NULL THEN 'Never Purchased'
        ELSE 'Dormant'
    END as activity_status,
    
    CASE 
        WHEN c.last_visit IS NOT NULL 
        THEN EXTRACT(DAY FROM CURRENT_DATE - c.last_visit::DATE)
        ELSE NULL 
    END as days_since_last_visit,
    
    CASE 
        WHEN c.visit_count > 0 
        THEN ROUND(c.total_spent / c.visit_count, 2)
        ELSE 0 
    END as avg_transaction_value,
    
    ctr.benefits as tier_benefits,
    ctr.calculation_multiplier as tier_multiplier,
    
    (
        SELECT tier_name 
        FROM customer_tier_rules 
        WHERE min_spending > c.total_spent 
        ORDER BY min_spending ASC 
        LIMIT 1
    ) as next_tier,
    
    (
        SELECT min_spending - c.total_spent 
        FROM customer_tier_rules 
        WHERE min_spending > c.total_spent 
        ORDER BY min_spending ASC 
        LIMIT 1
    ) as amount_to_next_tier

FROM customers c
LEFT JOIN customer_tier_rules ctr ON c.customer_tier = ctr.tier_name
ORDER BY c.tier_calculation_number DESC, c.total_spent DESC;

-- User permissions view
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
    u.id as user_id,
    u.email as username,
    u.email,
    u.first_name,
    u.last_name,
    r.name as role_name,
    r.permissions,
    u.is_active as user_active,
    r.is_active as role_active
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.is_active = true AND r.is_active = true;

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert sample locations
INSERT INTO locations (store_code, store_name, brand, address_line1, city, state, zip_code, tax_rate, manager_name) VALUES
('NYC001', 'Manhattan Flagship', 'TUMI', '350 Madison Avenue', 'New York', 'NY', '10017', 0.08875, 'John Manager'),
('LAX001', 'Beverly Hills Store', 'TUMI', '9570 Wilshire Boulevard', 'Beverly Hills', 'CA', '90212', 0.1025, 'Jane Store Manager'),
('CHI001', 'Michigan Avenue', 'TUMI', '900 N Michigan Avenue', 'Chicago', 'IL', '60611', 0.1025, 'Mike Regional Manager')
ON CONFLICT (store_code) DO NOTHING;

-- Insert default user settings
INSERT INTO user_settings (user_identifier, theme_mode) VALUES ('default_user', 'light')
ON CONFLICT (user_identifier) DO NOTHING;

-- Insert default tier rules
INSERT INTO customer_tier_rules (tier_name, min_spending, min_visits, min_points, calculation_multiplier, benefits) VALUES
('Bronze', 0.00, 0, 0, 1.00, 'Basic loyalty benefits, 1x points earning'),
('Silver', 250.00, 5, 100, 1.25, 'Enhanced benefits, 1.25x points earning, priority support'),
('Gold', 750.00, 15, 500, 1.50, 'Premium benefits, 1.5x points earning, exclusive offers'),
('Platinum', 2000.00, 30, 1500, 2.00, 'VIP benefits, 2x points earning, personal concierge service')
ON CONFLICT (tier_name) DO UPDATE SET
    min_spending = EXCLUDED.min_spending,
    min_visits = EXCLUDED.min_visits,
    min_points = EXCLUDED.min_points,
    calculation_multiplier = EXCLUDED.calculation_multiplier,
    benefits = EXCLUDED.benefits,
    updated_at = CURRENT_TIMESTAMP;

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_encrypted, is_active, created_by, updated_by) VALUES
('company_name', 'FAKE Store', 'text', 'Company name displayed on receipts and reports', 'general', false, true, 'admin', 'admin'),
('currency_symbol', '$', 'text', 'Currency symbol for displaying prices', 'general', false, true, 'admin', 'admin'),
('currency_code', 'USD', 'text', 'ISO currency code', 'general', false, true, 'admin', 'admin'),
('date_format', 'MM/DD/YYYY', 'text', 'Date format for display', 'general', false, true, 'admin', 'admin'),
('time_format', '12h', 'text', 'Time format (12h or 24h)', 'general', false, true, 'admin', 'admin'),
('tax_inclusive', 'false', 'text', 'Whether prices include tax', 'pos', false, true, 'admin', 'admin'),
('default_tax_rate', '0.08', 'text', 'Default tax rate for new locations', 'pos', false, true, 'admin', 'admin'),
('points_per_dollar', '1', 'text', 'Loyalty points earned per dollar spent', 'loyalty', false, true, 'admin', 'admin'),
('points_redemption_rate', '100', 'text', 'Points needed for $1 discount', 'loyalty', false, true, 'admin', 'admin'),
('low_stock_threshold', '5', 'text', 'Stock level to trigger low stock warning', 'inventory', false, true, 'admin', 'admin'),
('receipt_footer_text', 'Thank you for your business!', 'text', 'Text shown at bottom of receipts', 'pos', false, true, 'admin', 'admin'),
('enable_work_orders', 'true', 'text', 'Enable work order management system', 'general', false, true, 'admin', 'admin'),
('enable_multi_location', 'true', 'text', 'Enable multi-location support', 'general', false, true, 'admin', 'admin'),
('session_timeout_minutes', '30', 'text', 'Session timeout in minutes', 'general', false, true, 'admin', 'admin'),
('max_discount_percentage', '50', 'text', 'Maximum discount percentage allowed', 'pos', false, true, 'admin', 'admin'),
('require_customer_email', 'false', 'text', 'Require email for new customers', 'loyalty', false, true, 'admin', 'admin'),
('auto_generate_sku', 'true', 'text', 'Automatically generate SKUs for new products', 'inventory', false, true, 'admin', 'admin'),
('enable_barcode_scanning', 'false', 'text', 'Enable barcode scanning support', 'pos', false, true, 'admin', 'admin'),
('sf_api_key', 'asdlfjherlkgncvs4xxz', 'text', NULL, 'integration', false, true, 'admin', 'admin'),
('mulesoft_loyalty_sync_endpoint', 'https://loyalty-sync-w4i20p.5sc6y6-4.usa-e2.cloudhub.io', 'text', 'Protocol, hostname and port where the MuleSoft API is deployed', 'integration', false, true, 'admin', 'admin'),
('journal_subtype_id', '', 'text', 'Journal Sub-Type', 'loyalty', false, true, 'admin', 'admin'),
('journal_type_id', '', 'text', 'Journal Type', 'loyalty', false, true, 'admin', 'admin'),
('loyalty_program_id', '', 'text', 'Loyalty Program Id', 'loyalty', false, true, 'admin', 'admin'),
('enrollment_journal_subtype_id', '', 'text', NULL, 'integration', false, true, 'admin', 'admin')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Full system access with all permissions', 
 '{"pos": {"read": true, "write": true, "delete": true}, 
   "inventory": {"read": true, "write": true, "delete": true}, 
   "customers": {"read": true, "write": true, "delete": true}, 
   "transactions": {"read": true, "write": true, "delete": true}, 
   "reports": {"read": true, "write": true}, 
   "settings": {"read": true, "write": true, "delete": true}, 
   "users": {"read": true, "write": true, "delete": true}, 
   "locations": {"read": true, "write": true, "delete": true}}'),
('manager', 'Store management with limited admin access', 
 '{"pos": {"read": true, "write": true}, 
   "inventory": {"read": true, "write": true}, 
   "customers": {"read": true, "write": true}, 
   "transactions": {"read": true, "write": true}, 
   "reports": {"read": true, "write": true}, 
   "settings": {"read": true}, 
   "users": {"read": true}, 
   "locations": {"read": true, "write": true}}'),
('cashier', 'Basic POS operations and customer service', 
 '{"pos": {"read": true, "write": true}, 
   "inventory": {"read": true}, 
   "customers": {"read": true, "write": true}, 
   "transactions": {"read": true, "write": true}, 
   "reports": {"read": true}, 
   "settings": {"read": true}, 
   "users": {"read": true}, 
   "locations": {"read": true}}'),
('viewer', 'Read-only access for reporting and monitoring', 
 '{"pos": {"read": true}, 
   "inventory": {"read": true}, 
   "customers": {"read": true}, 
   "transactions": {"read": true}, 
   "reports": {"read": true}, 
   "settings": {"read": true}, 
   "users": {"read": true}, 
   "locations": {"read": true}}')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: P@$$word1)
INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active) 
SELECT 
    'admin',
    'admin@pos.com',
    hash_password('P@$$word1'),
    'System',
    'Administrator',
    r.id,
    true
FROM roles r 
WHERE r.name = 'admin'
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- This completes the simplified database schema
-- All tables are created with complete column definitions
-- All indexes, functions, triggers, and views are included
-- Sample data is inserted for testing
-- The database is ready for use
