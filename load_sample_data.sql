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

-- Update existing customers with new fields
UPDATE customers 
SET 
    member_status = 'Active',
    enrollment_date = created_at::DATE,
    member_type = 'Individual';

-- Recalculate all customer tiers for existing customers
SELECT recalculate_all_customer_tiers() as updated_customers;
