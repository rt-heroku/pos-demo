-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Products indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_collection ON products(collection);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_active ON products(is_active);

-- Customers indexes
CREATE INDEX idx_customers_loyalty_number ON customers(loyalty_number);
CREATE INDEX idx_customers_name ON customers(LOWER(name));
CREATE INDEX idx_customers_email ON customers(LOWER(email));
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_active ON customers(is_active);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_customers_last_visit ON customers(last_visit);
CREATE INDEX idx_customers_member_status ON customers(member_status);
CREATE INDEX idx_customers_member_type ON customers(member_type);
CREATE INDEX idx_customers_customer_tier ON customers(customer_tier);
CREATE INDEX idx_customers_enrollment_date ON customers(enrollment_date);
CREATE INDEX idx_customers_tier_calculation_number ON customers(tier_calculation_number);
CREATE INDEX idx_customers_sf_id ON customers(sf_id);

-- Transactions indexes
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_location_id ON transactions(location_id);

-- Transaction items indexes
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);

-- Generated products indexes
CREATE INDEX idx_generated_products_batch_id ON generated_products(batch);
CREATE INDEX idx_generated_products_brand_id ON generated_products(brand);
CREATE INDEX idx_generated_products_segment_id ON generated_products(segment);
CREATE INDEX idx_generated_products_created_at ON generated_products(created_at);

-- Product images and features indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_features_product_id ON product_features(product_id);

-- Locations indexes
CREATE INDEX idx_locations_store_code ON locations(store_code);
CREATE INDEX idx_locations_active ON locations(is_active);

-- User settings indexes
CREATE INDEX idx_user_settings_identifier ON user_settings(user_identifier);

-- Location inventory indexes
CREATE INDEX idx_location_inventory_location ON location_inventory(location_id);
CREATE INDEX idx_location_inventory_product ON location_inventory(product_id);

-- Work orders indexes
CREATE INDEX idx_work_orders_location ON work_orders(location_id);
CREATE INDEX idx_work_orders_customer ON work_orders(customer_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_created_date ON work_orders(created_date);
CREATE INDEX idx_work_order_products_work_order ON work_order_products(work_order_id);

-- Customer activity log indexes
CREATE INDEX idx_customer_activity_log_customer ON customer_activity_log(customer_id);
CREATE INDEX idx_customer_activity_log_type ON customer_activity_log(activity_type);
CREATE INDEX idx_customer_activity_log_created ON customer_activity_log(created_at);

-- System settings indexes
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_active ON system_settings(is_active);

-- Users and roles indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- =============================================================================
-- SEQUENCES
-- =============================================================================

CREATE SEQUENCE batch_number_seq START 1;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to get next batch number
CREATE OR REPLACE FUNCTION get_next_batch_number()
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE((SELECT MAX(batch) FROM generated_products), 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get next batch number using sequence
CREATE OR REPLACE FUNCTION get_next_batch_number_seq()
RETURNS INTEGER AS $$
BEGIN
    RETURN nextval('batch_number_seq');
END;
$$ LANGUAGE plpgsql;

-- Function to generate loyalty number
CREATE OR REPLACE FUNCTION generate_loyalty_number() RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
    max_attempts INTEGER := 100;
    attempt INTEGER := 0;
BEGIN
    LOOP
        SELECT COALESCE(MAX(CAST(SUBSTRING(loyalty_number FROM 4) AS INTEGER)), 0) + 1 
        INTO counter 
        FROM customers 
        WHERE loyalty_number LIKE 'LOY%' AND LENGTH(loyalty_number) = 6;
        
        new_number := 'LOY' || LPAD(counter::TEXT, 3, '0');
        
        IF NOT EXISTS (SELECT 1 FROM customers WHERE loyalty_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique loyalty number after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate SKU
CREATE OR REPLACE FUNCTION generate_sku(product_brand TEXT, product_type TEXT) RETURNS TEXT AS $$
DECLARE
    brand_code TEXT;
    type_code TEXT;
    counter INTEGER;
    new_sku TEXT;
BEGIN
    brand_code := UPPER(SUBSTRING(COALESCE(product_brand, 'GEN'), 1, 3));
    type_code := UPPER(SUBSTRING(COALESCE(product_type, 'PRD'), 1, 3));
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(sku FROM 7) AS INTEGER)), 0) + 1
    INTO counter
    FROM products 
    WHERE sku LIKE brand_code || type_code || '%'
    AND LENGTH(sku) = 9;
    
    new_sku := brand_code || '-' || type_code || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_sku;
END;
$$ LANGUAGE plpgsql;

-- Function to generate work order number
CREATE OR REPLACE FUNCTION generate_work_order_number(loc_id INTEGER) RETURNS TEXT AS $$
DECLARE
    location_code TEXT;
    counter INTEGER;
    new_number TEXT;
BEGIN
    SELECT store_code INTO location_code FROM locations WHERE id = loc_id;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM LENGTH(location_code) + 3) AS INTEGER)), 0) + 1
    INTO counter
    FROM work_orders 
    WHERE work_order_number LIKE location_code || '-WO%';
    
    new_number := location_code || '-WO-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate customer tier
CREATE OR REPLACE FUNCTION calculate_customer_tier(
    p_total_spent DECIMAL,
    p_visit_count INTEGER,
    p_points INTEGER
) RETURNS VARCHAR(20) AS $$
DECLARE
    tier_result VARCHAR(20) := 'Bronze';
BEGIN
    IF p_total_spent >= 2000.00 AND p_visit_count >= 30 AND p_points >= 1500 THEN
        tier_result := 'Platinum';
    ELSIF p_total_spent >= 750.00 AND p_visit_count >= 15 AND p_points >= 500 THEN
        tier_result := 'Gold';
    ELSIF p_total_spent >= 250.00 AND p_visit_count >= 5 AND p_points >= 100 THEN
        tier_result := 'Silver';
    ELSE
        tier_result := 'Bronze';
    END IF;
    
    RETURN tier_result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate tier number
CREATE OR REPLACE FUNCTION calculate_tier_number(
    p_total_spent DECIMAL,
    p_visit_count INTEGER,
    p_points INTEGER,
    p_tier VARCHAR(20)
) RETURNS DECIMAL AS $$
DECLARE
    base_score DECIMAL := 0.00;
    tier_multiplier DECIMAL := 1.00;
BEGIN
    SELECT calculation_multiplier INTO tier_multiplier
    FROM customer_tier_rules
    WHERE tier_name = p_tier;
    
    base_score := (p_total_spent * 0.5) + (p_visit_count * 10) + (p_points * 0.1);
    
    RETURN ROUND(base_score * tier_multiplier, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to log customer activity
CREATE OR REPLACE FUNCTION log_customer_activity(
    p_customer_id INTEGER,
    p_activity_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_points_change INTEGER DEFAULT 0,
    p_transaction_id INTEGER DEFAULT NULL,
    p_created_by VARCHAR(255) DEFAULT 'system'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO customer_activity_log 
    (customer_id, activity_type, description, points_change, transaction_id, created_by)
    VALUES 
    (p_customer_id, p_activity_type, p_description, p_points_change, p_transaction_id, p_created_by);
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate all customer tiers
CREATE OR REPLACE FUNCTION recalculate_all_customer_tiers() RETURNS INTEGER AS $$
DECLARE
    customer_record RECORD;
    updated_count INTEGER := 0;
    new_tier VARCHAR(20);
    new_calculation_number DECIMAL;
BEGIN
    FOR customer_record IN 
        SELECT id, total_spent, visit_count, points 
        FROM customers 
        WHERE member_status = 'Active'
    LOOP
        new_tier := calculate_customer_tier(
            customer_record.total_spent, 
            customer_record.visit_count, 
            customer_record.points
        );
        
        new_calculation_number := calculate_tier_number(
            customer_record.total_spent, 
            customer_record.visit_count, 
            customer_record.points,
            new_tier
        );
        
        UPDATE customers 
        SET 
            customer_tier = new_tier,
            tier_calculation_number = new_calculation_number,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = customer_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- System settings functions
CREATE OR REPLACE FUNCTION get_system_setting(p_key VARCHAR(100)) 
RETURNS TEXT AS $$
DECLARE
    v_value TEXT;
BEGIN
    SELECT setting_value INTO v_value
    FROM system_settings
    WHERE setting_key = p_key
    AND is_active = true
    LIMIT 1;
    
    RETURN v_value;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_system_setting_or_default(
    p_key VARCHAR(100),
    p_default TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_value TEXT;
BEGIN
    v_value := get_system_setting(p_key);
    
    IF v_value IS NULL THEN
        RETURN p_default;
    END IF;
    
    RETURN v_value;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_system_setting(
    p_key VARCHAR(100),
    p_value TEXT,
    p_description TEXT DEFAULT NULL,
    p_category VARCHAR(50) DEFAULT 'general',
    p_user VARCHAR(100) DEFAULT 'system'
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO system_settings (setting_key, setting_value, description, category, created_by, updated_by)
    VALUES (p_key, p_value, p_description, p_category, p_user, p_user)
    ON CONFLICT (setting_key) 
    DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        description = COALESCE(EXCLUDED.description, system_settings.description),
        category = EXCLUDED.category,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = EXCLUDED.updated_by;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- User management functions
CREATE OR REPLACE FUNCTION hash_password(password TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN 'hashed_' || encode(sha256(password::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN hash = 'hashed_' || encode(sha256(password::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_session_token() RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id INTEGER,
    p_activity_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_activity_log 
    (user_id, activity_type, description, ip_address, user_agent, metadata)
    VALUES 
    (p_user_id, p_activity_type, p_description, p_ip_address, p_user_agent, p_metadata);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id INTEGER,
    p_module VARCHAR(50),
    p_action VARCHAR(20)
) RETURNS BOOLEAN AS $$
DECLARE
    user_perms JSONB;
BEGIN
    SELECT permissions INTO user_perms
    FROM user_permissions
    WHERE user_id = p_user_id;
    
    IF user_perms IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN COALESCE(user_perms->p_module->>p_action, 'false')::BOOLEAN;
END;
$$ LANGUAGE plpgsql;
