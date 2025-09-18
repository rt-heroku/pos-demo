-- Simplified Database Schema for POS System
-- This file creates a clean database structure without incremental changes
-- Drops all tables first, then creates complete tables with all columns
-- Finally adds indexes, functions, triggers, and sample data

-- =============================================================================
-- DROP ALL EXISTING OBJECTS
-- =============================================================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS enhanced_customer_dashboard CASCADE;
DROP VIEW IF EXISTS customer_management_dashboard CASCADE;
DROP VIEW IF EXISTS work_orders_summary CASCADE;
DROP VIEW IF EXISTS location_inventory_view CASCADE;
DROP VIEW IF EXISTS user_permissions CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_customer_tier_and_stats ON transactions CASCADE;
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON transactions CASCADE;
DROP TRIGGER IF EXISTS trigger_update_customer_stats_enhanced ON transactions CASCADE;
DROP TRIGGER IF EXISTS trigger_set_work_order_number ON work_orders CASCADE;
DROP TRIGGER IF EXISTS trigger_update_location_inventory ON transactions CASCADE;
DROP TRIGGER IF EXISTS trigger_log_work_order_status_change ON work_orders CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_customer_tier_summary() CASCADE;
DROP FUNCTION IF EXISTS get_customer_summary(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS recalculate_all_customer_tiers() CASCADE;
DROP FUNCTION IF EXISTS update_customer_tier_and_stats() CASCADE;
DROP FUNCTION IF EXISTS calculate_tier_number(DECIMAL, INTEGER, INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS calculate_customer_tier(DECIMAL, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS log_customer_activity(INTEGER, VARCHAR, TEXT, INTEGER, INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS update_customer_stats_enhanced() CASCADE;
DROP FUNCTION IF EXISTS update_customer_stats() CASCADE;
DROP FUNCTION IF EXISTS generate_loyalty_number() CASCADE;
DROP FUNCTION IF EXISTS log_work_order_status_change() CASCADE;
DROP FUNCTION IF EXISTS update_location_inventory() CASCADE;
DROP FUNCTION IF EXISTS set_work_order_number() CASCADE;
DROP FUNCTION IF EXISTS generate_work_order_number(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS generate_sku(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_next_batch_number_seq() CASCADE;
DROP FUNCTION IF EXISTS get_next_batch_number() CASCADE;
DROP FUNCTION IF EXISTS check_user_permission(INTEGER, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS create_session_token() CASCADE;
DROP FUNCTION IF EXISTS log_user_activity(INTEGER, VARCHAR, TEXT, INET, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS verify_password(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS hash_password(TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_system_setting(VARCHAR, TEXT, TEXT, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_system_setting_or_default(VARCHAR, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_system_setting(VARCHAR) CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS batch_number_seq CASCADE;

-- Drop all tables (in dependency order)
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS customer_tier_rules CASCADE;
DROP TABLE IF EXISTS customer_preferences CASCADE;
DROP TABLE IF EXISTS customer_activity_log CASCADE;
DROP TABLE IF EXISTS work_order_status_history CASCADE;
DROP TABLE IF EXISTS work_order_products CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS location_inventory CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS product_features CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS generated_products CASCADE;

-- =============================================================================
-- CREATE COMPLETE TABLES
-- =============================================================================

-- Products table with all columns
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image VARCHAR(10) DEFAULT '📦',
    sku VARCHAR(50) UNIQUE,
    product_type VARCHAR(100),
    laptop_size VARCHAR(20),
    brand VARCHAR(100),
    collection VARCHAR(100),
    material VARCHAR(100),
    gender VARCHAR(20),
    color VARCHAR(50),
    description TEXT,
    dimensions VARCHAR(100),
    weight DECIMAL(5,2),
    warranty_info TEXT,
    care_instructions TEXT,
    main_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    sf_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user INTEGER
);

-- Customers table with all columns
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    loyalty_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    visit_count INTEGER DEFAULT 0,
    last_visit TIMESTAMP,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    preferred_contact VARCHAR(20) DEFAULT 'email',
    date_of_birth DATE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    marketing_consent BOOLEAN DEFAULT false,
    member_status VARCHAR(50) DEFAULT 'Active' CHECK (member_status IN ('Active', 'Inactive', 'Under Fraud Investigation', 'Merged', 'Fraudulent Member')),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    member_type VARCHAR(20) DEFAULT 'Individual' CHECK (member_type IN ('Individual', 'Corporate')),
    sf_id VARCHAR(100),
    customer_tier VARCHAR(20) DEFAULT 'Bronze' CHECK (customer_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    tier_calculation_number DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user INTEGER
);

-- Transactions table with all columns
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    location_id INTEGER,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount_received DECIMAL(10,2),
    change_amount DECIMAL(10,2) DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_type VARCHAR(20),
    discount_reason VARCHAR(255),
    card_last_four VARCHAR(4),
    card_type VARCHAR(20),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user INTEGER
);

-- Transaction items table
CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Generated products table
CREATE TABLE generated_products (
    id SERIAL PRIMARY KEY,
    batch INTEGER,
    brand VARCHAR(100),
    segment VARCHAR(100),
    num_of_products INTEGER,
    generated_product JSON,
    prompt TEXT,
    raw_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images table
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product features table
CREATE TABLE product_features (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    store_code VARCHAR(10) UNIQUE NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_rate DECIMAL(5,4) DEFAULT 0.0800,
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    logo_url TEXT,
    logo_base64 TEXT,
    is_active BOOLEAN DEFAULT true,
    business_hours JSONB,
    manager_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user INTEGER
);

-- User settings table
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_identifier VARCHAR(255) UNIQUE NOT NULL,
    selected_location_id INTEGER REFERENCES locations(id),
    theme_mode VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    currency_format VARCHAR(10) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Location inventory table
CREATE TABLE location_inventory (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 5,
    last_restock_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, product_id)
);

-- Work orders table
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    work_order_number VARCHAR(20) UNIQUE NOT NULL,
    location_id INTEGER REFERENCES locations(id) NOT NULL,
    customer_id INTEGER REFERENCES customers(id) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    work_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'New',
    assigned_to VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_date TIMESTAMP,
    start_date TIMESTAMP,
    estimated_completion_date DATE,
    actual_completion_date TIMESTAMP,
    labor_hours DECIMAL(5,2) DEFAULT 0.00,
    labor_rate DECIMAL(8,2) DEFAULT 0.00,
    parts_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    customer_notes TEXT,
    internal_notes TEXT,
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work order products table
CREATE TABLE work_order_products (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(50),
    serial_number VARCHAR(100),
    issue_description TEXT,
    resolution TEXT,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work order status history table
CREATE TABLE work_order_status_history (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by VARCHAR(255),
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer activity log table
CREATE TABLE customer_activity_log (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    points_change INTEGER DEFAULT 0,
    transaction_id INTEGER REFERENCES transactions(id),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer preferences table
CREATE TABLE customer_preferences (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, preference_key)
);

-- Customer tier rules table
CREATE TABLE customer_tier_rules (
    id SERIAL PRIMARY KEY,
    tier_name VARCHAR(20) NOT NULL UNIQUE,
    min_spending DECIMAL(10,2) DEFAULT 0.00,
    min_visits INTEGER DEFAULT 0,
    min_points INTEGER DEFAULT 0,
    calculation_multiplier DECIMAL(4,2) DEFAULT 1.00,
    benefits TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_encrypted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password_expires_at TIMESTAMP,
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- User sessions table
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activity log table
CREATE TABLE user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints that were missing
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_location_id FOREIGN KEY (location_id) REFERENCES locations(id);
ALTER TABLE products ADD CONSTRAINT fk_products_created_by_user FOREIGN KEY (created_by_user) REFERENCES users(id);
ALTER TABLE customers ADD CONSTRAINT fk_customers_created_by_user FOREIGN KEY (created_by_user) REFERENCES users(id);
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_created_by_user FOREIGN KEY (created_by_user) REFERENCES users(id);
ALTER TABLE locations ADD CONSTRAINT fk_locations_created_by_user FOREIGN KEY (created_by_user) REFERENCES users(id);
