-- Updated database schema with loyalty system

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image VARCHAR(10) DEFAULT '📦',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table with loyalty system
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    loyalty_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    visit_count INTEGER DEFAULT 0,
    last_visit TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount_received DECIMAL(10,2),
    change_amount DECIMAL(10,2) DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_number ON customers(loyalty_number);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);


-- Function to generate loyalty number
CREATE OR REPLACE FUNCTION generate_loyalty_number() RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(loyalty_number FROM 4) AS INTEGER)), 0) + 1 
    INTO counter 
    FROM customers 
    WHERE loyalty_number LIKE 'LOY%';
    
    new_number := 'LOY' || LPAD(counter::TEXT, 3, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer stats
CREATE OR REPLACE FUNCTION update_customer_stats() RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers 
    SET 
        points = points + NEW.points_earned - COALESCE(NEW.points_redeemed, 0),
        total_spent = total_spent + NEW.total,
        visit_count = visit_count + 1,
        last_visit = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON transactions;
CREATE TRIGGER trigger_update_customer_stats
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();



-- Drop existing tables if recreating (optional - use with caution)
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_features CASCADE;

-- Update products table with additional fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS product_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS laptop_size VARCHAR(20),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS collection VARCHAR(100),
ADD COLUMN IF NOT EXISTS material VARCHAR(100),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS warranty_info TEXT,
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS main_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.products ADD sf_id varchar NULL;

-- Create product images table for multiple images
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product features table for multiple features
CREATE TABLE IF NOT EXISTS product_features (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_features_product_id ON product_features(product_id);

-- Function to generate SKU
CREATE OR REPLACE FUNCTION generate_sku(product_brand TEXT, product_type TEXT) RETURNS TEXT AS $$
DECLARE
    brand_code TEXT;
    type_code TEXT;
    counter INTEGER;
    new_sku TEXT;
BEGIN
    -- Get brand code (first 3 letters, uppercase)
    brand_code := UPPER(SUBSTRING(COALESCE(product_brand, 'GEN'), 1, 3));
    
    -- Get type code (first 3 letters, uppercase)
    type_code := UPPER(SUBSTRING(COALESCE(product_type, 'PRD'), 1, 3));
    
    -- Get next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(sku FROM 7) AS INTEGER)), 0) + 1
    INTO counter
    FROM products 
    WHERE sku LIKE brand_code || type_code || '%'
    AND LENGTH(sku) = 9;
    
    -- Format: BRN-TYP-001
    new_sku := brand_code || '-' || type_code || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_sku;
END;
$$ LANGUAGE plpgsql;

-- Update existing products with enhanced data (sample data based on Tumi examples)
INSERT INTO public.products ("name",price,category,stock,image,created_at,updated_at,sku,product_type,laptop_size,brand,collection,material,gender,color,description,dimensions,weight,warranty_info,care_instructions,main_image_url,is_active,featured,sort_order,sf_id) VALUES
     ('Alpha Bravo Business Backpack',395.00,'Backpacks',14,'🎒','2025-08-01 14:57:51.790811','2025-08-04 16:50:21.345291','TUM-BAG-002','Backpack','15"','TUMI','Alpha Bravo','Ballistic Nylon','Unisex','Anthracite','This compact backpack with a streamlined silhouette has smart organization for commuting and travel gear, as well as a dedicated padded laptop compartment.','17.5" x 12.5" x 7"',3.80,'','','https://tumi.scene7.com/is/image/Tumi/1426141041_main?wid=1020&hei=1238',true,true,0,'01tHo000004zTtgIAE'),
     ('Voyageur Celina Backpack',275.00,'Backpacks',16,'🎒','2025-08-01 14:57:51.790811','2025-08-04 17:56:14.077857','TUM-BAG-003','Backpack','13"','TUMI','Voyageur','Nylon','Women','Black','Lightweight everyday backpack with modern design','15" x 11" x 5"',2.10,'','','https://tumi.scene7.com/is/image/Tumi/146566T522_main?wid=1020&hei=1238',true,false,0,'01tHo000004zTtvIAE'),
     ('Alpha Continental Carry-On',1050.00,'Carry-On',11,'🧳','2025-08-01 14:57:51.790811','2025-08-08 14:25:17.900774','TUM-LUG-003','Luggage','','TUMI','Alpha','Ballistic Nylon','Unisex','Black','Versatile and compact, this case makes taking your business on the road a breeze. With the option of being carried or wheeled, it gives you flexibility wherever you need to travel.','22" x 14" x 9"',8.90,'','','https://tumi.scene7.com/is/image/Tumi/1171571041_main?wid=1020&hei=1238',true,false,0,'01tHo000004zTtWIAU'),
     ('19 Degree Extended Trip Case',950.00,'Luggage',6,'🧳','2025-08-01 14:57:51.790811','2025-08-08 14:28:36.550216','TUM-CASE-01','Luggage','','TUMI','','','Unisex','','','',NULL,'','','https://tumi.scene7.com/is/image/Tumi/1171611041_main?wid=1020&hei=1238',true,false,0,'01tHo000004zTtlIAE'),
     ('Harrison Nylon Portfolio',225.00,'Accessories',24,'💼','2025-08-01 14:57:51.790811','2025-08-04 17:51:04.211511','TUM-ACC-001','Portfolio','12"','TUMI','Harrison','Nylon','Unisex','Navy','Carry what you need in style for daily commutes or as a personal item when you fly. This elevated messenger includes thoughtfully placed pockets to carry and organize your laptop, work documents, and more','13" x 10" x 1"',0.80,'','','https://tumi.scene7.com/is/image/Tumi/1524241041_main?wid=1020&hei=1238',true,false,0,'01tHo000004zTtqIAE');


-- Insert sample customers with loyalty numbers
INSERT INTO customers (loyalty_number, name, email, phone, points, total_spent, visit_count, last_visit) VALUES
('LOY001', 'John Doe', 'john@email.com', '555-0123', 150, 75.50, 12, '2025-07-25 14:30:00'),
('LOY002', 'Jane Smith', 'jane@email.com', '555-0456', 220, 110.25, 18, '2025-07-28 10:15:00'),
('LOY003', 'Mike Johnson', 'mike@email.com', '555-0789', 80, 40.00, 6, '2025-07-20 16:45:00'),
('LOY004', 'Sarah Wilson', 'sarah@email.com', '555-0321', 350, 175.75, 25, '2025-07-29 12:00:00');

-- Insert sample transactions
INSERT INTO public.transactions (customer_id,subtotal,tax,total,payment_method,amount_received,change_amount,points_earned,points_redeemed,created_at) VALUES
     (1,1445.00,115.60,1560.60,'cash',1560.60,NULL,1560,0,'2025-08-05 15:33:37.880566'),
     (2,1450.00,116.00,1566.00,'cash',1566.00,NULL,1566,0,'2025-08-05 15:07:48.454387'),
     (3,950.00,76.00,1026.00,'cash',1026.00,NULL,1026,0,'2025-08-05 19:12:52.504183'),
     (4,825.00,66.00,891.00,'cash',891.00,NULL,891,0,'2025-08-05 19:13:14.823182');

-- Insert sample transaction items
INSERT INTO public.transaction_items (transaction_id,product_id,product_name,product_price,quantity,subtotal) VALUES
     (34,13,'19 Degree Extended Trip Case',950.00,1,950.00),
     (34,12,'Voyageur Celina Backpack',275.00,1,275.00),
     (34,15,'Harrison Nylon Portfolio',225.00,1,225.00),
     (35,11,'Alpha Bravo Business Backpack',395.00,1,395.00),
     (35,14,'Alpha Continental Carry-On',1050.00,1,1050.00),
     (36,13,'19 Degree Extended Trip Case',950.00,1,950.00),
     (37,12,'Voyageur Celina Backpack',275.00,3,825.00);


-- Insert sample product features
INSERT INTO product_features (product_id, feature_name, feature_value) VALUES
(1, 'Expandable', 'Yes'),
(1, 'Lock Type', 'TSA Combination Lock'),
(1, 'Wheel Type', '4 Dual Spinner Wheels'),
(1, 'Handle Type', 'Telescoping Handle'),
(1, 'Interior Organization', 'Compression Straps'),
(2, 'Laptop Compartment', 'Padded 15" compartment'),
(2, 'USB Port', 'Integrated charging port'),
(2, 'Organizational Pockets', 'Multiple interior pockets'),
(2, 'Water Resistant', 'Weather-resistant exterior');

-- Insert sample product images

-- Add features for new products
INSERT INTO product_features (product_id, feature_name, feature_value) VALUES
-- Alpha Bravo Backpack features
((SELECT id FROM products WHERE sku = 'TUM-BAG-002'), 'Water Resistant', 'Yes'),
((SELECT id FROM products WHERE sku = 'TUM-BAG-002'), 'Organizational Pockets', '15+ pockets'),
((SELECT id FROM products WHERE sku = 'TUM-BAG-002'), 'Laptop Protection', 'Padded compartment'),
((SELECT id FROM products WHERE sku = 'TUM-BAG-002'), 'Durability', 'Military-spec ballistic nylon'),

-- Voyageur Carson features
((SELECT id FROM products WHERE sku = 'TUM-BAG-003'), 'Weight', 'Ultra-lightweight'),
((SELECT id FROM products WHERE sku = 'TUM-BAG-003'), 'Style', 'Feminine design'),
((SELECT id FROM products WHERE sku = 'TUM-BAG-003'), 'Comfort', 'Padded shoulder straps'),

-- 19 Degree Extended Trip features
((SELECT id FROM products WHERE sku = 'TUM-LUG-002'), 'Capacity', '120 Liters'),
((SELECT id FROM products WHERE sku = 'TUM-LUG-002'), 'Expandable', 'Up to 25% more space'),
((SELECT id FROM products WHERE sku = 'TUM-LUG-002'), 'Security', 'Integrated TSA lock'),
((SELECT id FROM products WHERE sku = 'TUM-LUG-002'), 'Wheels', '4 dual spinner wheels'),

-- Alpha Continental features
((SELECT id FROM products WHERE sku = 'TUM-LUG-003'), 'Access', 'Dual-sided access'),
((SELECT id FROM products WHERE sku = 'TUM-LUG-003'), 'Organization', 'Garment compartment'),
((SELECT id FROM products WHERE sku = 'TUM-LUG-003'), 'Durability', 'FXT ballistic nylon'),

-- Harrison Portfolio features
((SELECT id FROM products WHERE sku = 'TUM-ACC-001'), 'Slim Profile', 'Ultra-thin design'),
((SELECT id FROM products WHERE sku = 'TUM-ACC-001'), 'Protection', 'Padded tablet sleeve'),
((SELECT id FROM products WHERE sku = 'TUM-ACC-001'), 'Organization', 'Document compartments');



-- Aug 06 
-- Enhanced Database Schema for Multi-Location POS System with Service Management
-- This builds upon the existing schema with new location-based features

-- Create locations table (core table for multi-location support)
CREATE TABLE IF NOT EXISTS locations (
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
    tax_rate DECIMAL(5,4) DEFAULT 0.0800, -- 8% default, stored as decimal (0.0800)
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    logo_url TEXT,
    logo_base64 TEXT, -- BASE64 encoded logo image
    is_active BOOLEAN DEFAULT true,
    business_hours JSONB, -- Store hours as JSON: {"monday": {"open": "09:00", "close": "18:00"}, ...}
    manager_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user settings table for app preferences
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_identifier VARCHAR(255) UNIQUE NOT NULL, -- Browser fingerprint or user ID
    selected_location_id INTEGER REFERENCES locations(id),
    theme_mode VARCHAR(20) DEFAULT 'light', -- 'light' or 'dark'
    language VARCHAR(10) DEFAULT 'en',
    currency_format VARCHAR(10) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add location_id to existing transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES locations(id),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20), -- 'percentage' or 'fixed'
ADD COLUMN IF NOT EXISTS discount_reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS card_last_four VARCHAR(4), -- Last 4 digits of credit card
ADD COLUMN IF NOT EXISTS card_type VARCHAR(20), -- Visa, MasterCard, etc.
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100); -- Transaction ID from payment processor

-- Create location_inventory table to track stock by location
CREATE TABLE IF NOT EXISTS location_inventory (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0, -- For work orders
    reorder_level INTEGER DEFAULT 5,
    last_restock_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, product_id)
);

-- Create work_orders table for service management
CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    work_order_number VARCHAR(20) UNIQUE NOT NULL,
    location_id INTEGER REFERENCES locations(id) NOT NULL,
    customer_id INTEGER REFERENCES customers(id) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    work_type VARCHAR(100) NOT NULL, -- 'Repair', 'Maintenance', 'Customization', etc.
    priority VARCHAR(20) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(50) DEFAULT 'New', -- 'New', 'Scheduled', 'Assigned', 'In Progress', 'Completed', 'Closed'
    assigned_to VARCHAR(255), -- Technician or employee name
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

-- Create work_order_products table (products involved in the work order)
CREATE TABLE IF NOT EXISTS work_order_products (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- Snapshot in case product is deleted
    product_sku VARCHAR(50),
    serial_number VARCHAR(100),
    issue_description TEXT,
    resolution TEXT,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create work_order_status_history for tracking status changes
CREATE TABLE IF NOT EXISTS work_order_status_history (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by VARCHAR(255),
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_store_code ON locations(store_code);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_user_settings_identifier ON user_settings(user_identifier);
CREATE INDEX IF NOT EXISTS idx_transactions_location_id ON transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_location ON location_inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_product ON location_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_location ON work_orders(location_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_date ON work_orders(created_date);
CREATE INDEX IF NOT EXISTS idx_work_order_products_work_order ON work_order_products(work_order_id);

-- Functions for generating work order numbers
CREATE OR REPLACE FUNCTION generate_work_order_number(loc_id INTEGER) RETURNS TEXT AS $$
DECLARE
    location_code TEXT;
    counter INTEGER;
    new_number TEXT;
BEGIN
    -- Get the store code for the location
    SELECT store_code INTO location_code FROM locations WHERE id = loc_id;
    
    -- Get next sequential number for this location
    SELECT COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM LENGTH(location_code) + 3) AS INTEGER)), 0) + 1
    INTO counter
    FROM work_orders 
    WHERE work_order_number LIKE location_code || '-WO%';
    
    -- Format: STORECODE-WO-001
    new_number := location_code || '-WO-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate work order numbers
CREATE OR REPLACE FUNCTION set_work_order_number() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.work_order_number IS NULL OR NEW.work_order_number = '' THEN
        NEW.work_order_number := generate_work_order_number(NEW.location_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_work_order_number ON work_orders;
CREATE TRIGGER trigger_set_work_order_number
    BEFORE INSERT ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_work_order_number();

-- Trigger to update location inventory after transactions
CREATE OR REPLACE FUNCTION update_location_inventory() RETURNS TRIGGER AS $$
BEGIN
    -- Update inventory quantities based on transaction items
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

DROP TRIGGER IF EXISTS trigger_update_location_inventory ON transactions;
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

DROP TRIGGER IF EXISTS trigger_log_work_order_status_change ON work_orders;
CREATE TRIGGER trigger_log_work_order_status_change
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_work_order_status_change();

-- Insert sample locations
INSERT INTO locations (store_code, store_name, brand, address_line1, city, state, zip_code, tax_rate, manager_name) VALUES
('NYC001', 'Manhattan Flagship', 'TUMI', '350 Madison Avenue', 'New York', 'NY', '10017', 0.08875, 'John Manager'),
('LAX001', 'Beverly Hills Store', 'TUMI', '9570 Wilshire Boulevard', 'Beverly Hills', 'CA', '90212', 0.1025, 'Jane Store Manager'),
('CHI001', 'Michigan Avenue', 'TUMI', '900 N Michigan Avenue', 'Chicago', 'IL', '60611', 0.1025, 'Mike Regional Manager')
ON CONFLICT (store_code) DO NOTHING;

-- Insert sample location inventory (migrate existing product stock)
INSERT INTO location_inventory (location_id, product_id, quantity)
SELECT 1 as location_id, id, stock FROM products WHERE stock > 0
ON CONFLICT (location_id, product_id) DO NOTHING;

-- Update existing transactions to have location_id (assign to first location)
UPDATE transactions SET location_id = 1 WHERE location_id IS NULL;

-- Insert sample work orders
INSERT INTO work_orders (location_id, customer_id, subject, work_type, priority, status, description) VALUES
(1, 1, 'Zipper Repair on Alpha Backpack', 'Repair', 'Medium', 'New', 'Customer reports zipper is stuck and needs professional repair'),
(1, 2, 'Wheel Replacement on 19 Degree Luggage', 'Repair', 'High', 'Scheduled', 'One wheel is damaged and needs replacement'),
(2, 3, 'Leather Conditioning Service', 'Maintenance', 'Low', 'In Progress', 'Annual leather conditioning for briefcase'),
(2, 4, 'Custom Monogram Addition', 'Customization', 'Medium', 'Completed', 'Add customer initials to new purchase')
ON CONFLICT (work_order_number) DO NOTHING;

-- Insert work order products
INSERT INTO work_order_products (work_order_id, product_id, product_name, product_sku, issue_description) VALUES
(1, 2, 'Alpha Bravo Business Backpack', 'TUM-BAG-002', 'Main zipper stuck, requires replacement'),
(2, 4, '19 Degree Extended Trip Case', 'TUM-LUG-004', 'Front right wheel damaged, wobbles when rolling'),
(3, 1, 'Harrison Nylon Portfolio', 'TUM-ACC-001', 'Leather shows wear, needs conditioning'),
(4, 3, 'Alpha Continental Carry-On', 'TUM-LUG-003', 'New purchase, add monogram to front panel');

-- Create view for location inventory with product details
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

-- Create view for work order summary
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

-- Insert default user settings (for browser-based usage)
INSERT INTO user_settings (user_identifier, theme_mode) VALUES ('default_user', 'light')
ON CONFLICT (user_identifier) DO NOTHING;


ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_contact VARCHAR(20) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- Create customer activity log table
CREATE TABLE IF NOT EXISTS customer_activity_log (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'purchase', 'points_earned', 'points_redeemed', 'profile_updated', etc.
    description TEXT,
    points_change INTEGER DEFAULT 0, -- positive for earned, negative for redeemed
    transaction_id INTEGER REFERENCES transactions(id),
    created_by VARCHAR(255), -- staff member or 'system'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customer preferences table
CREATE TABLE IF NOT EXISTS customer_preferences (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, preference_key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON customers(last_visit);
CREATE INDEX IF NOT EXISTS idx_customer_activity_log_customer ON customer_activity_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_activity_log_type ON customer_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_customer_activity_log_created ON customer_activity_log(created_at);

-- Enhanced loyalty number generation function
CREATE OR REPLACE FUNCTION generate_loyalty_number() RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
    max_attempts INTEGER := 100;
    attempt INTEGER := 0;
BEGIN
    LOOP
        -- Get the next sequential number
        SELECT COALESCE(MAX(CAST(SUBSTRING(loyalty_number FROM 4) AS INTEGER)), 0) + 1 
        INTO counter 
        FROM customers 
        WHERE loyalty_number LIKE 'LOY%' AND LENGTH(loyalty_number) = 6;
        
        new_number := 'LOY' || LPAD(counter::TEXT, 3, '0');
        
        -- Check if this number already exists (extra safety check)
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

-- Enhanced trigger to update customer stats and log activity
CREATE OR REPLACE FUNCTION update_customer_stats_enhanced() RETURNS TRIGGER AS $$
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
    
    -- Log the purchase activity
    PERFORM log_customer_activity(
        NEW.customer_id,
        'purchase',
        'Purchase transaction #' || NEW.id,
        NEW.points_earned - COALESCE(NEW.points_redeemed, 0),
        NEW.id,
        'pos_system'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON transactions;
CREATE TRIGGER trigger_update_customer_stats
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats_enhanced();

-- Function to get customer summary with recent activity
CREATE OR REPLACE FUNCTION get_customer_summary(p_customer_id INTEGER)
RETURNS TABLE (
    customer_info JSON,
    recent_activity JSON,
    stats JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Customer basic info
        row_to_json(c) as customer_info,
        
        -- Recent activity (last 10 activities)
        (
            SELECT json_agg(
                json_build_object(
                    'activity_type', cal.activity_type,
                    'description', cal.description,
                    'points_change', cal.points_change,
                    'created_at', cal.created_at,
                    'created_by', cal.created_by
                )
            )
            FROM customer_activity_log cal 
            WHERE cal.customer_id = p_customer_id 
            ORDER BY cal.created_at DESC 
            LIMIT 10
        ) as recent_activity,
        
        -- Customer stats
        json_build_object(
            'total_transactions', (
                SELECT COUNT(*) FROM transactions t WHERE t.customer_id = p_customer_id
            ),
            'avg_transaction_value', (
                SELECT COALESCE(AVG(total), 0) FROM transactions t WHERE t.customer_id = p_customer_id
            ),
            'favorite_products', (
                SELECT json_agg(
                    json_build_object(
                        'product_name', ti.product_name,
                        'total_quantity', SUM(ti.quantity),
                        'total_spent', SUM(ti.subtotal)
                    )
                )
                FROM transactions t
                JOIN transaction_items ti ON t.id = ti.transaction_id
                WHERE t.customer_id = p_customer_id
                GROUP BY ti.product_name
                ORDER BY SUM(ti.quantity) DESC
                LIMIT 5
            ),
            'monthly_spending', (
                SELECT json_agg(
                    json_build_object(
                        'month', DATE_TRUNC('month', t.created_at),
                        'total_spent', SUM(t.total),
                        'transaction_count', COUNT(*)
                    )
                )
                FROM transactions t
                WHERE t.customer_id = p_customer_id
                  AND t.created_at >= CURRENT_DATE - INTERVAL '12 months'
                GROUP BY DATE_TRUNC('month', t.created_at)
                ORDER BY DATE_TRUNC('month', t.created_at) DESC
            )
        ) as stats
    FROM customers c
    WHERE c.id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for customer management dashboard
CREATE OR REPLACE VIEW customer_management_dashboard AS
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
    c.is_active,
    c.notes,
    -- Calculate customer tier based on spending
    CASE 
        WHEN c.total_spent >= 1000 THEN 'Platinum'
        WHEN c.total_spent >= 500 THEN 'Gold'
        WHEN c.total_spent >= 100 THEN 'Silver'
        ELSE 'Bronze'
    END as customer_tier,
    
    -- Recent activity indicator
    CASE 
        WHEN c.last_visit >= CURRENT_DATE - INTERVAL '30 days' THEN 'Active'
        WHEN c.last_visit >= CURRENT_DATE - INTERVAL '90 days' THEN 'Inactive'
        WHEN c.last_visit IS NULL THEN 'New'
        ELSE 'Dormant'
    END as activity_status,
    
    -- Calculate days since last visit
    CASE 
        WHEN c.last_visit IS NOT NULL 
        THEN EXTRACT(DAY FROM CURRENT_DATE - c.last_visit)
        ELSE NULL 
    END as days_since_last_visit,
    
    -- Customer lifetime value indicators
    CASE 
        WHEN c.visit_count > 0 
        THEN ROUND(c.total_spent / c.visit_count, 2)
        ELSE 0 
    END as avg_transaction_value,
    
    -- Points redemption rate (if we track redeemed points)
    ROUND((c.points::DECIMAL / GREATEST(c.total_spent, 1)) * 100, 1) as points_earning_rate

FROM customers c
WHERE c.is_active = true
ORDER BY c.total_spent DESC, c.last_visit DESC;

-- Insert sample data updates for existing customers
UPDATE customers 
SET 
    notes = CASE 
        WHEN loyalty_number = 'LOY001' THEN 'Frequent visitor, prefers email communication'
        WHEN loyalty_number = 'LOY002' THEN 'VIP customer, birthday is in December'
        WHEN loyalty_number = 'LOY003' THEN 'New customer, interested in backpack collection'
        WHEN loyalty_number = 'LOY004' THEN 'Business customer, bulk purchaser'
        ELSE notes
    END,
    is_active = true,
    preferred_contact = 'email',
    marketing_consent = true
WHERE loyalty_number IN ('LOY001', 'LOY002', 'LOY003', 'LOY004');

-- Create some sample customer activity logs for existing transactions
INSERT INTO customer_activity_log (customer_id, activity_type, description, points_change, transaction_id, created_by)
SELECT 
    t.customer_id,
    'purchase',
    'Historical purchase transaction #' || t.id,
    COALESCE(t.points_earned, 0) - COALESCE(t.points_redeemed, 0),
    t.id,
    'data_migration'
FROM transactions t
WHERE t.customer_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create some sample customer preferences
INSERT INTO customer_preferences (customer_id, preference_key, preference_value)
SELECT 
    c.id,
    'notification_method',
    CASE 
        WHEN c.email IS NOT NULL THEN 'email'
        WHEN c.phone IS NOT NULL THEN 'sms'
        ELSE 'none'
    END
FROM customers c
WHERE c.is_active = true
ON CONFLICT (customer_id, preference_key) DO NOTHING;

-- Enhanced Customer Database Schema with Status, Tiers, and Member Types
-- Run these commands to update your customer management system

-- First, update the customers table with new fields
ALTER TABLE customers 
DROP COLUMN IF EXISTS is_active CASCADE;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS member_status VARCHAR(50) DEFAULT 'Active' CHECK (member_status IN ('Active', 'Inactive', 'Under Fraud Investigation', 'Merged', 'Fraudulent Member')),
ADD COLUMN IF NOT EXISTS enrollment_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS member_type VARCHAR(20) DEFAULT 'Individual' CHECK (member_type IN ('Individual', 'Corporate')),
ADD COLUMN IF NOT EXISTS sf_id VARCHAR(100), -- Salesforce ID, not visible in app
ADD COLUMN IF NOT EXISTS customer_tier VARCHAR(20) DEFAULT 'Bronze' CHECK (customer_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
ADD COLUMN IF NOT EXISTS tier_calculation_number DECIMAL(10,2) DEFAULT 0.00;

-- Create customer tier rules table
CREATE TABLE IF NOT EXISTS customer_tier_rules (
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

-- Function to calculate customer tier based on spending, visits, and points
CREATE OR REPLACE FUNCTION calculate_customer_tier(
    p_total_spent DECIMAL,
    p_visit_count INTEGER,
    p_points INTEGER
) RETURNS VARCHAR(20) AS $$
DECLARE
    tier_result VARCHAR(20) := 'Bronze';
BEGIN
    -- Check tier requirements in descending order
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

-- Function to calculate tier-based calculation number
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
    -- Get tier multiplier
    SELECT calculation_multiplier INTO tier_multiplier
    FROM customer_tier_rules
    WHERE tier_name = p_tier;
    
    -- Calculate base score
    base_score := (p_total_spent * 0.5) + (p_visit_count * 10) + (p_points * 0.1);
    
    -- Apply tier multiplier
    RETURN ROUND(base_score * tier_multiplier, 2);
END;
$$ LANGUAGE plpgsql;

-- Enhanced trigger to update customer tier and calculation number
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

-- Update the trigger
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON transactions;
DROP TRIGGER IF EXISTS trigger_update_customer_stats_enhanced ON transactions;
CREATE TRIGGER trigger_update_customer_tier_and_stats
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_tier_and_stats();

-- Function to recalculate all customer tiers (useful for maintenance)
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
        -- Calculate new tier
        new_tier := calculate_customer_tier(
            customer_record.total_spent, 
            customer_record.visit_count, 
            customer_record.points
        );
        
        -- Calculate new tier number
        new_calculation_number := calculate_tier_number(
            customer_record.total_spent, 
            customer_record.visit_count, 
            customer_record.points,
            new_tier
        );
        
        -- Update customer
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

-- Update indexes for new fields
CREATE INDEX IF NOT EXISTS idx_customers_member_status ON customers(member_status);
CREATE INDEX IF NOT EXISTS idx_customers_member_type ON customers(member_type);
CREATE INDEX IF NOT EXISTS idx_customers_customer_tier ON customers(customer_tier);
CREATE INDEX IF NOT EXISTS idx_customers_enrollment_date ON customers(enrollment_date);
CREATE INDEX IF NOT EXISTS idx_customers_tier_calculation_number ON customers(tier_calculation_number);
CREATE INDEX IF NOT EXISTS idx_customers_sf_id ON customers(sf_id);

-- Enhanced customer management dashboard view
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
    
    -- Days since enrollment (fixed casting)
    EXTRACT(DAY FROM CURRENT_DATE - c.enrollment_date::DATE) as days_since_enrollment,
    
    -- Member for (years/months) - fixed casting
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.enrollment_date::DATE)) >= 1 THEN
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.enrollment_date::DATE))::TEXT || ' years'
        ELSE
            EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.enrollment_date::DATE))::TEXT || ' months'
    END as member_duration,
    
    -- Activity status based on member_status and last_visit
    CASE 
        WHEN c.member_status != 'Active' THEN c.member_status
        WHEN c.last_visit >= CURRENT_DATE - INTERVAL '30 days' THEN 'Recently Active'
        WHEN c.last_visit >= CURRENT_DATE - INTERVAL '90 days' THEN 'Moderately Active'
        WHEN c.last_visit IS NULL THEN 'Never Purchased'
        ELSE 'Dormant'
    END as activity_status,
    
    -- Days since last visit (fixed casting)
    CASE 
        WHEN c.last_visit IS NOT NULL 
        THEN EXTRACT(DAY FROM CURRENT_DATE - c.last_visit::DATE)
        ELSE NULL 
    END as days_since_last_visit,
    
    -- Average transaction value
    CASE 
        WHEN c.visit_count > 0 
        THEN ROUND(c.total_spent / c.visit_count, 2)
        ELSE 0 
    END as avg_transaction_value,
    
    -- Tier benefits
    ctr.benefits as tier_benefits,
    ctr.calculation_multiplier as tier_multiplier,
    
    -- Next tier information
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

-- Update existing customers with new fields
UPDATE customers 
SET 
    member_status = 'Active',
    enrollment_date = created_at::DATE,
    member_type = 'Individual';

-- Recalculate all customer tiers for existing customers
SELECT recalculate_all_customer_tiers() as updated_customers;

-- Create some sample corporate customers
INSERT INTO customers (loyalty_number, name, email, phone, member_type, member_status, enrollment_date, notes) VALUES
('CRP001', 'TechCorp Solutions', 'purchasing@techcorp.com', '(555) 987-6543', 'Corporate', 'Active', CURRENT_DATE - INTERVAL '6 months', 'Corporate account for bulk purchases'),
('CRP002', 'Global Industries LLC', 'admin@globalindustries.com', '(555) 876-5432', 'Corporate', 'Active', CURRENT_DATE - INTERVAL '1 year', 'Large enterprise customer, quarterly orders')
ON CONFLICT (loyalty_number) DO NOTHING;

-- Update some existing customers with different statuses for testing
UPDATE customers 
SET member_status = CASE 
    WHEN loyalty_number = 'LOY003' THEN 'Inactive'
    WHEN loyalty_number = 'LOY004' THEN 'Under Fraud Investigation'
    ELSE member_status
END
WHERE loyalty_number IN ('LOY003', 'LOY004');

-- Function to get customer tier summary
CREATE OR REPLACE FUNCTION get_customer_tier_summary()
RETURNS TABLE (
    tier_name VARCHAR(20),
    customer_count BIGINT,
    total_spending DECIMAL,
    avg_spending DECIMAL,
    total_points BIGINT,
    avg_points DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.customer_tier,
        COUNT(*) as customer_count,
        COALESCE(SUM(c.total_spent), 0) as total_spending,
        COALESCE(AVG(c.total_spent), 0) as avg_spending,
        COALESCE(SUM(c.points), 0) as total_points,
        COALESCE(AVG(c.points), 0) as avg_points
    FROM customers c
    WHERE c.member_status = 'Active'
    GROUP BY c.customer_tier
    ORDER BY 
        CASE c.customer_tier
            WHEN 'Platinum' THEN 4
            WHEN 'Gold' THEN 3
            WHEN 'Silver' THEN 2
            WHEN 'Bronze' THEN 1
        END DESC;
END;
$$ LANGUAGE plpgsql;


-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
    description TEXT,
    category VARCHAR(50) DEFAULT 'general', -- 'general', 'pos', 'loyalty', 'inventory', 'email', 'integration'
    is_encrypted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_active ON system_settings(is_active);

-- Function to get system setting by key
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

-- Function to get system setting with default value
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

-- Function to set system setting
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

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, category) VALUES
('company_name', 'TUMI Store', 'Company name displayed on receipts and reports', 'general'),
('currency_symbol', '$', 'Currency symbol for displaying prices', 'general'),
('currency_code', 'USD', 'ISO currency code', 'general'),
('date_format', 'MM/DD/YYYY', 'Date format for display', 'general'),
('time_format', '12h', 'Time format (12h or 24h)', 'general'),
('tax_inclusive', 'false', 'Whether prices include tax', 'pos'),
('default_tax_rate', '0.08', 'Default tax rate for new locations', 'pos'),
('points_per_dollar', '1', 'Loyalty points earned per dollar spent', 'loyalty'),
('points_redemption_rate', '100', 'Points needed for $1 discount', 'loyalty'),
('low_stock_threshold', '5', 'Stock level to trigger low stock warning', 'inventory'),
('receipt_footer_text', 'Thank you for your business!', 'Text shown at bottom of receipts', 'pos'),
('enable_work_orders', 'true', 'Enable work order management system', 'general'),
('enable_multi_location', 'true', 'Enable multi-location support', 'general'),
('session_timeout_minutes', '30', 'Session timeout in minutes', 'general'),
('max_discount_percentage', '50', 'Maximum discount percentage allowed', 'pos'),
('require_customer_email', 'false', 'Require email for new customers', 'loyalty'),
('auto_generate_sku', 'true', 'Automatically generate SKUs for new products', 'inventory'),
('enable_barcode_scanning', 'false', 'Enable barcode scanning support', 'pos'),
('smtp_host', '', 'SMTP server for sending emails', 'email'),
('smtp_port', '587', 'SMTP port', 'email'),
('smtp_user', '', 'SMTP username', 'email'),
('smtp_from_email', '', 'From email address', 'email'),
('backup_enabled', 'false', 'Enable automatic backups', 'general'),
('backup_frequency_hours', '24', 'Backup frequency in hours', 'general'),
('journal_type_id', '0lEHo000000E5sgMAC' , 'Journal Type', 'Loyalty'),
('journal_subtype_id', '0lSHo000000E107MAC' , 'Journal Sub-Type', 'Loyalty'),
('loyalty_program_id', '0lpHo000000xTCMIA2' , 'JLoyalty Program Id', 'Loyalty' ,
)
ON CONFLICT (setting_key) DO NOTHING;

-- Example of using the function in a query
-- SELECT 
--     *,
--     get_system_setting('points_per_dollar')::INTEGER as points_multiplier,
--     get_system_setting_or_default('company_name', 'Default Store') as store_name
-- FROM transactions;

-- Authentication and User Management System
-- Add these tables to your existing database schema

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_activity_log table for audit trail
CREATE TABLE IF NOT EXISTS user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
-- CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

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

-- Function to hash passwords (using bcrypt simulation)
CREATE OR REPLACE FUNCTION hash_password(password TEXT) RETURNS TEXT AS $$
BEGIN
    -- In production, use proper bcrypt library
    -- For demo purposes, we'll use a simple hash
    RETURN 'hashed_' || encode(sha256(password::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT) RETURNS BOOLEAN AS $$
BEGIN
    -- In production, use proper bcrypt verification
    -- For demo purposes, we'll use simple comparison
    RETURN hash = 'hashed_' || encode(sha256(password::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to log user activity
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

-- Function to create session token
CREATE OR REPLACE FUNCTION create_session_token() RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user (password: P@$$word1)
INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active) 
SELECT 
    'admin',
    'admin@pos-system.com',
    hash_password('P@$$word1'),
    'System',
    'Administrator',
    r.id,
    true
FROM roles r 
WHERE r.name = 'admin'
ON CONFLICT (username) DO NOTHING;

-- Add user_id to existing tables for audit trail
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_user INTEGER REFERENCES users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by_user INTEGER REFERENCES users(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by_user INTEGER REFERENCES users(id);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS created_by_user INTEGER REFERENCES users(id);

-- Update existing records to have admin as creator
UPDATE transactions SET created_by_user = (SELECT id FROM users WHERE username = 'admin' LIMIT 1) WHERE created_by_user IS NULL;
UPDATE customers SET created_by_user = (SELECT id FROM users WHERE username = 'admin' LIMIT 1) WHERE created_by_user IS NULL;
UPDATE products SET created_by_user = (SELECT id FROM users WHERE username = 'admin' LIMIT 1) WHERE created_by_user IS NULL;
UPDATE locations SET created_by_user = (SELECT id FROM users WHERE username = 'admin' LIMIT 1) WHERE created_by_user IS NULL;

-- Create view for user permissions
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

-- Function to check user permission
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
