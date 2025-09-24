-- Remove laptop_size column from products table
-- This script removes the laptop_size column and all references to it

-- Remove the laptop_size column from the products table
ALTER TABLE products DROP COLUMN IF EXISTS laptop_size;

-- Verify the column has been removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'laptop_size';
