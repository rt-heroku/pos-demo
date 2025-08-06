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
UPDATE products SET 
    sku = 'TUM-LUG-001',
    product_type = 'Luggage',
    brand = 'TUMI',
    collection = '19 Degree',
    material = 'Polycarbonate',
    gender = 'Unisex',
    color = 'Black',
    description = 'International Expandable 4 Wheeled Carry-On with signature 19 Degree design',
    dimensions = '22" x 14" x 9"',
    weight = 7.5,
    warranty_info = '5-year warranty against manufacturing defects',
    main_image_url = 'https://example.com/luggage1.jpg'
WHERE name = 'Coffee';

UPDATE products SET 
    sku = 'TUM-BAG-001',
    product_type = 'Backpack',
    brand = 'TUMI',
    collection = 'Alpha',
    material = 'Ballistic Nylon',
    gender = 'Unisex',
    color = 'Black',
    description = 'Business backpack with laptop compartment and organizational features',
    dimensions = '17" x 12" x 6"',
    weight = 3.2,
    laptop_size = '15"',
    warranty_info = '5-year warranty against manufacturing defects',
    main_image_url = 'https://example.com/backpack1.jpg'
WHERE name = 'Sandwich';

-- Insert sample products
INSERT INTO public.products ("name",price,category,stock,image,created_at,updated_at,sku,product_type,laptop_size,brand,collection,material,gender,color,description,dimensions,weight,warranty_info,care_instructions,main_image_url,is_active,featured,sort_order) VALUES
     ('Harrison Nylon Portfolio',225.00,'Accessories',24,'💼','2025-08-01 14:57:51.790811','2025-08-04 17:51:04.211511','TUM-ACC-001','Portfolio','12"','TUMI','Harrison','Nylon','Unisex','Navy','Carry what you need in style for daily commutes or as a personal item when you fly. This elevated messenger includes thoughtfully placed pockets to carry and organize your laptop, work documents, and more','13" x 10" x 1"',0.80,'','','https://tumi.scene7.com/is/image/Tumi/1524241041_main?wid=1020&hei=1238',true,false,0),
     ('Alpha Bravo Business Backpack',395.00,'Backpacks',14,'🎒','2025-08-01 14:57:51.790811','2025-08-04 16:50:21.345291','TUM-BAG-002','Backpack','15"','TUMI','Alpha Bravo','Ballistic Nylon','Unisex','Anthracite','This compact backpack with a streamlined silhouette has smart organization for commuting and travel gear, as well as a dedicated padded laptop compartment.','17.5" x 12.5" x 7"',3.80,'','','https://tumi.scene7.com/is/image/Tumi/1426141041_main?wid=1020&hei=1238',true,true,0),
     ('Alpha Continental Carry-On',1050.00,'Luggage',11,'🧳','2025-08-01 14:57:51.790811','2025-08-04 17:47:48.574674','TUM-LUG-003','Luggage','','TUMI','Alpha','Ballistic Nylon','Unisex','Black','Versatile and compact, this case makes taking your business on the road a breeze. With the option of being carried or wheeled, it gives you flexibility wherever you need to travel.','22" x 14" x 9"',8.90,'','','https://tumi.scene7.com/is/image/Tumi/1171571041_main?wid=1020&hei=1238',true,false,0),
     ('19 Degree Extended Trip Case',950.00,'Luggage',6,'🧳','2025-08-01 14:57:51.790811','2025-08-04 16:49:57.71472','','','','TUMI','','','Unisex','','','',NULL,'','','https://tumi.scene7.com/is/image/Tumi/1171611041_main?wid=1020&hei=1238',true,false,0),
     ('Voyageur Celina Backpack',275.00,'Backpacks',16,'🎒','2025-08-01 14:57:51.790811','2025-08-04 17:56:14.077857','TUM-BAG-003','Backpack','13"','TUMI','Voyageur','Nylon','Women','Black','Lightweight everyday backpack with modern design','15" x 11" x 5"',2.10,'','','https://tumi.scene7.com/is/image/Tumi/146566T522_main?wid=1020&hei=1238',true,false,0);


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